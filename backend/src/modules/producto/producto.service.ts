import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private productoRepo: Repository<Producto>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const producto = this.productoRepo.create(createProductoDto);
    return this.productoRepo.save(producto);
  }

  async findAll(empresaId?: string): Promise<Producto[]> {
    const where: any = { activo: true };
    if (empresaId) {
      where.empresaId = empresaId;
    }
    
    return this.productoRepo.find({
      where,
      order: { nombre: 'ASC' },
    });
  }
}