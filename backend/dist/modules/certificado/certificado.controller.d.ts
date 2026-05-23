import { CertificadoService } from './certificado.service';
export declare class CertificadoController {
    private readonly certificadoService;
    constructor(certificadoService: CertificadoService);
    uploadCertificado(file: Express.Multer.File, password: string, esProduccion: string, empresaId: string): Promise<{
        message: string;
        certificado: {
            id: string;
            sujeto: string;
            emisor: string;
            fechaExpiracion: Date;
        };
    }>;
}
