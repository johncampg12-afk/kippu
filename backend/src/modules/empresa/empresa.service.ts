import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private empresaRepo: Repository<Empresa>,
  ) {}

  async create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    const existing = await this.empresaRepo.findOne({
      where: { ruc: createEmpresaDto.ruc },
    });

    if (existing) {
      throw new ConflictException('Ya existe una empresa con este RUC');
    }

    const empresa = this.empresaRepo.create(createEmpresaDto);
    return this.empresaRepo.save(empresa);
  }

  async findAll(): Promise<Empresa[]> {
    return this.empresaRepo.find({
      where: { activo: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Empresa> {
    const empresa = await this.empresaRepo.findOne({ where: { id } });
    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }
    return empresa;
  }

  async update(id: string, updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa> {
    const empresa = await this.findOne(id);
    
    if (updateEmpresaDto.ruc && updateEmpresaDto.ruc !== empresa.ruc) {
      const existing = await this.empresaRepo.findOne({
        where: { ruc: updateEmpresaDto.ruc },
      });
      if (existing) {
        throw new ConflictException('Ya existe una empresa con este RUC');
      }
    }

    Object.assign(empresa, updateEmpresaDto);
    return this.empresaRepo.save(empresa);
  }

  async remove(id: string): Promise<void> {
    const empresa = await this.findOne(id);
    empresa.activo = false;
    await this.empresaRepo.save(empresa);
  }
}