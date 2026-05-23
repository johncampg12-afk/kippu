import { Repository } from 'typeorm';
import { Factura } from '../factura/entities/factura.entity';
export declare class SriEnvioService {
    private facturaRepo;
    constructor(facturaRepo: Repository<Factura>);
    enviarComprobante(facturaId: string): Promise<any>;
    consultarComprobante(claveAcceso: string, ambiente?: string): Promise<any>;
    private construirSoapEnvelope;
    private construirSoapConsulta;
    private procesarRespuestaRecepcion;
    private procesarRespuestaAutorizacion;
}
