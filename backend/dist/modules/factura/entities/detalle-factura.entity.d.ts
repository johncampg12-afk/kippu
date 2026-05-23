import { Factura } from './factura.entity';
import { Producto } from '../../producto/entities/producto.entity';
export declare class DetalleFactura {
    id: string;
    codigoProducto: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    subtotal: number;
    codigoIva: string;
    valorIva: number;
    codigoIce: string;
    valorIce: number;
    factura: Factura;
    facturaId: string;
    producto: Producto;
    productoId: string;
}
