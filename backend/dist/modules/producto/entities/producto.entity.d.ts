import { Empresa } from '../../empresa/entities/empresa.entity';
export declare class Producto {
    id: string;
    codigo: string;
    nombre: string;
    descripcion: string;
    precioUnitario: number;
    codigoIva: string;
    codigoIce: string;
    porcentajeIce: number;
    activo: boolean;
    empresa: Empresa;
    empresaId: string;
    createdAt: Date;
    updatedAt: Date;
}
