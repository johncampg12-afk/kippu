import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
export declare class ProductoController {
    private readonly productoService;
    constructor(productoService: ProductoService);
    create(createProductoDto: CreateProductoDto): Promise<import("./entities/producto.entity").Producto>;
    findAll(empresaId?: string): Promise<import("./entities/producto.entity").Producto[]>;
}
