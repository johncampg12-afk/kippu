import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Empresa)
    private empresaRepo: Repository<Empresa>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('El email ya está registrado');

    const existingEmpresa = await this.empresaRepo.findOne({ where: { ruc: dto.ruc } });
    if (existingEmpresa) throw new ConflictException('El RUC ya está registrado');

    // Crear empresa
    const empresa = this.empresaRepo.create({
      ruc: dto.ruc,
      razonSocial: dto.razonSocial,
      nombreComercial: dto.nombreComercial,
      direccionMatriz: dto.direccionMatriz,
      codigoEstablecimiento: dto.codigoEstablecimiento,
      codigoPuntoEmision: dto.codigoPuntoEmision,
      obligadoContabilidad: true,
    });
    const empresaGuardada = await this.empresaRepo.save(empresa);

    // Crear usuario
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      empresaId: empresaGuardada.id,
    });
    await this.userRepo.save(user);

    return this.generateToken(user, empresaGuardada);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email }, relations: ['empresa'] });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas');

    return this.generateToken(user, user.empresa);
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['empresa'] });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, empresa: user.empresa };
  }

  private generateToken(user: User, empresa: Empresa) {
    const payload = { sub: user.id, email: user.email, empresaId: empresa.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      empresa: {
        id: empresa.id,
        ruc: empresa.ruc,
        razonSocial: empresa.razonSocial,
        nombreComercial: empresa.nombreComercial,
      },
    };
  }
}