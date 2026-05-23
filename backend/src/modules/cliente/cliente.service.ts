import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const existing = await this.clienteRepo.findOne({
      where: { 
        identificacion: createClienteDto.identificacion,
        empresaId: createClienteDto.empresaId 
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe un cliente con esta identificación');
    }

    const cliente = this.clienteRepo.create(createClienteDto);
    return this.clienteRepo.save(cliente);
  }

  async findAll(empresaId?: string): Promise<Cliente[]> {
    const where: any = { activo: true };
    if (empresaId) {
      where.empresaId = empresaId;
    }
    
    return this.clienteRepo.find({
      where,
      order: { razonSocial: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepo.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  async update(id: string, updateData: Partial<CreateClienteDto>): Promise<Cliente> {
    const cliente = await this.findOne(id);
    Object.assign(cliente, updateData);
    return this.clienteRepo.save(cliente);
  }

  async remove(id: string): Promise<void> {
    const cliente = await this.findOne(id);
    cliente.activo = false;
    await this.clienteRepo.save(cliente);
  }
}