import { Repository } from 'typeorm';
import { Certificado } from './entities/certificado.entity';
export declare class CertificadoService {
    private certificadoRepo;
    constructor(certificadoRepo: Repository<Certificado>);
    uploadCertificado(file: Express.Multer.File, password: string, empresaId: string, esProduccion?: boolean): Promise<{
        message: string;
        certificado: {
            id: string;
            sujeto: string;
            emisor: string;
            fechaExpiracion: Date;
        };
    }>;
}
