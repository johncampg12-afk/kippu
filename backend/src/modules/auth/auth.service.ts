import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
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

  async googleLogin(googleToken: string) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Token de Google inválido');
      }

      const { email, name } = payload;

      // Buscar usuario por email
      let user = await this.userRepo.findOne({ where: { email }, relations: ['empresa'] });

      if (!user) {
        // Crear empresa temporal (datos se completarán dentro de la app)
        const empresa = this.empresaRepo.create({
          ruc: 'PENDIENTE',
          razonSocial: name || email,
          nombreComercial: name || email,
          direccionMatriz: 'PENDIENTE',
          codigoEstablecimiento: '001',
          codigoPuntoEmision: '001',
          obligadoContabilidad: false,
        });
        const empresaGuardada = await this.empresaRepo.save(empresa);

        // Crear usuario sin contraseña
        user = this.userRepo.create({
          name: name || email,
          email,
          password: '', // Usuario de Google no tiene contraseña local
          empresaId: empresaGuardada.id,
        });
        await this.userRepo.save(user);
        user.empresa = empresaGuardada;
      }

      return this.generateToken(user, user.empresa);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Error al verificar token de Google');
    }
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