import type { Response } from 'express';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Repository } from 'typeorm';
import { Factura } from './entities/factura.entity';
export declare class FacturaController {
    private readonly facturaService;
    private facturaRepo;
    constructor(facturaService: FacturaService, facturaRepo: Repository<Factura>);
    create(createFacturaDto: CreateFacturaDto, req: any): Promise<Factura>;
    findAll(req: any, fechaInicio?: string, fechaFin?: string, cliente?: string, estado?: string): Promise<Factura[]>;
    getEstadisticas(req: any): Promise<{
        facturasMes: number;
        totalMes: number;
        porCobrar: number;
        vencenHoy: number;
    }>;
    exportarExcel(req: any, fechaInicio: string, fechaFin: string, res: Response): Promise<void>;
}
