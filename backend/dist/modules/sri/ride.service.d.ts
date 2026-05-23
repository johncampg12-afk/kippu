import { Repository } from 'typeorm';
import { Factura } from '../factura/entities/factura.entity';
export declare class RideService {
    private facturaRepo;
    constructor(facturaRepo: Repository<Factura>);
    generarRide(facturaId: string): Promise<string>;
    private generarTablaDetalles;
    private generarTotales;
    private formatearFechaCompleta;
    private formatearTipoIdentificacion;
}
