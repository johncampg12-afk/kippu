import { Empresa } from '../../empresa/entities/empresa.entity';
export declare class Certificado {
    id: string;
    nombre: string;
    rutaArchivo: string;
    passwordEncriptada: string;
    fechaEmision: Date;
    fechaExpiracion: Date;
    emisor: string;
    sujeto: string;
    activo: boolean;
    esProduccion: boolean;
    empresa: Empresa;
    empresaId: string;
    createdAt: Date;
    updatedAt: Date;
}
