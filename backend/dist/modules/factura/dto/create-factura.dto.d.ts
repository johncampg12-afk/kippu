declare class DetalleFacturaDto {
    productoId?: string;
    codigoProducto: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    descuento?: number;
    subtotal: number;
    codigoIva: string;
    valorIva: number;
    codigoIce?: string;
    valorIce?: number;
}
export declare class CreateFacturaDto {
    empresaId: string;
    clienteId: string;
    fechaEmision: string;
    razonSocialComprador: string;
    identificacionComprador: string;
    tipoIdentificacionComprador: string;
    direccionComprador?: string;
    subtotal12: number;
    subtotal0: number;
    subtotalNoIva: number;
    subtotal: number;
    totalDescuento: number;
    iva12: number;
    ice?: number;
    total: number;
    ambiente?: string;
    tipoEmision?: string;
    detalles: DetalleFacturaDto[];
}
export {};
