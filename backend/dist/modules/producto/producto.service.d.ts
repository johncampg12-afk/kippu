import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
export declare class ProductoService {
    private productoRepo;
    constructor(productoRepo: Repository<Producto>);
    create(createProductoDto: CreateProductoDto): Promise<Producto>;
    findAll(empresaId?: string): Promise<Producto[]>;
}
