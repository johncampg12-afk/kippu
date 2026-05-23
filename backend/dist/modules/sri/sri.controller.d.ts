import type { Response } from 'express';
import { SriService } from './sri.service';
import { FirmaElectronicaService } from './firma-electronica.service';
import { RideService } from './ride.service';
import { SriEnvioService } from './sri-envio.service';
import { SriRucService } from './sri-ruc.service';
import { Repository } from 'typeorm';
import { Certificado } from '../certificado/entities/certificado.entity';
import { Factura } from '../factura/entities/factura.entity';
export declare class SriController {
    private readonly sriService;
    private readonly firmaService;
    private readonly rideService;
    private readonly sriEnvioService;
    private readonly sriRucService;
    private certificadoRepo;
    private facturaRepo;
    constructor(sriService: SriService, firmaService: FirmaElectronicaService, rideService: RideService, sriEnvioService: SriEnvioService, sriRucService: SriRucService, certificadoRepo: Repository<Certificado>, facturaRepo: Repository<Factura>);
    generarXml(facturaId: string): Promise<{
        message: string;
        facturaId: string;
        xmlPath: string;
        xmlPreview: string;
    }>;
    firmarXml(facturaId: string, certificadoId: string, password: string): Promise<{
        message: string;
        facturaId: string;
        xmlFirmadoPath: string;
    }>;
    descargarXml(facturaId: string): Promise<{
        xml: string;
    }>;
    validarCertificado(rutaCertificado: string, password: string): Promise<any>;
    verificarFirma(facturaId: string): Promise<{
        firmaValida: boolean;
        xmlFirmadoPath: string;
    }>;
    generarRide(facturaId: string): Promise<{
        message: string;
        facturaId: string;
        pdfPath: string;
    }>;
    descargarRide(facturaId: string, res: Response): Promise<void>;
    enviarComprobante(facturaId: string): Promise<any>;
    consultarComprobante(claveAcceso: string, ambiente?: string): Promise<any>;
    consultarRuc(ruc: string): Promise<any>;
    guardarDatosRuc(body: {
        ruc: string;
        razonSocial: string;
        nombreComercial?: string;
        direccion?: string;
        email?: string;
        telefono?: string;
        obligadoContabilidad?: boolean;
        tipoContribuyente?: string;
    }): Promise<{
        message: string;
    }>;
}
