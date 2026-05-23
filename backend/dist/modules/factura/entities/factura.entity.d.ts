import { Empresa } from '../../empresa/entities/empresa.entity';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { DetalleFactura } from './detalle-factura.entity';
export declare enum EstadoFactura {
    PENDIENTE = "PENDIENTE",
    FIRMADA = "FIRMADA",
    ENVIADA = "ENVIADA",
    AUTORIZADA = "AUTORIZADA",
    RECHAZADA = "RECHAZADA",
    ANULADA = "ANULADA"
}
export declare enum TipoDocumento {
    FACTURA = "01",
    NOTA_CREDITO = "04",
    NOTA_DEBITO = "05",
    GUIA_REMISION = "06",
    RETENCION = "07"
}
export declare class Factura {
    id: string;
    claveAcceso: string;
    numeroComprobante: string;
    fechaEmision: Date;
    tipoDocumento: TipoDocumento;
    ambiente: string;
    tipoEmision: string;
    razonSocialComprador: string;
    identificacionComprador: string;
    tipoIdentificacionComprador: string;
    direccionComprador: string;
    subtotal12: number;
    subtotal0: number;
    subtotalNoIva: number;
    subtotal: number;
    totalDescuento: number;
    iva12: number;
    ice: number;
    total: number;
    moneda: string;
    numeroAutorizacion: string;
    fechaAutorizacion: Date;
    xmlPath: string;
    pdfPath: string;
    mensajeError: string;
    estado: EstadoFactura;
    empresa: Empresa;
    empresaId: string;
    cliente: Cliente;
    clienteId: string;
    detalles: DetalleFactura[];
    createdAt: Date;
    updatedAt: Date;
}
