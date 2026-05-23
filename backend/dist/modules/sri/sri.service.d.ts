import { Repository } from 'typeorm';
import { Factura } from '../factura/entities/factura.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
export declare class SriService {
    private facturaRepo;
    private empresaRepo;
    constructor(facturaRepo: Repository<Factura>, empresaRepo: Repository<Empresa>);
    generarXmlFactura(facturaId: string): Promise<string>;
    private mapearCodigoIva;
    private mapearTipoIdentificacion;
    private extraerSecuencial;
    private formatearFecha;
    guardarXml(facturaId: string, xml: string): Promise<string>;
}
