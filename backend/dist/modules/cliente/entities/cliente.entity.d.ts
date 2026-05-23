import { Empresa } from '../../empresa/entities/empresa.entity';
export declare class Cliente {
    id: string;
    identificacion: string;
    tipoIdentificacion: string;
    razonSocial: string;
    direccion: string;
    telefono: string;
    email: string;
    activo: boolean;
    empresa: Empresa;
    empresaId: string;
    createdAt: Date;
    updatedAt: Date;
}
