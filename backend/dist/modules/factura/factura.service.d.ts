import { Repository } from 'typeorm';
import { Factura } from './entities/factura.entity';
import { DetalleFactura } from './entities/detalle-factura.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Empresa } from '../empresa/entities/empresa.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
export declare class FacturaService {
    private facturaRepo;
    private detalleRepo;
    private empresaRepo;
    private clienteRepo;
    constructor(facturaRepo: Repository<Factura>, detalleRepo: Repository<DetalleFactura>, empresaRepo: Repository<Empresa>, clienteRepo: Repository<Cliente>);
    create(createFacturaDto: CreateFacturaDto): Promise<Factura>;
    private calcularDigitoVerificador;
    findAll(): Promise<Factura[]>;
}
