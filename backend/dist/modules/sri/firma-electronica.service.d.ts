export declare class FirmaElectronicaService {
    firmarXml(xmlPath: string, certificadoPath: string, passwordCertificado: string): Promise<string>;
    validarCertificado(certificadoPath: string, password: string): any;
    verificarFirma(xmlFirmadoPath: string): boolean;
}
