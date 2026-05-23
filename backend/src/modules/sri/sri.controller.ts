import { Controller, Post, Param, Get, Body, BadRequestException, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { SriService } from './sri.service';
import { FirmaElectronicaService } from './firma-electronica.service';
import { RideService } from './ride.service';
import { SriEnvioService } from './sri-envio.service';
import { SriRucService } from './sri-ruc.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificado } from '../certificado/entities/certificado.entity';
import { Factura } from '../factura/entities/factura.entity';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';

@Controller('sri')
export class SriController {
  constructor(
    private readonly sriService: SriService,
    private readonly firmaService: FirmaElectronicaService,
    private readonly rideService: RideService,
    private readonly sriEnvioService: SriEnvioService,
    private readonly sriRucService: SriRucService,
    @InjectRepository(Certificado)
    private certificadoRepo: Repository<Certificado>,
    @InjectRepository(Factura)
    private facturaRepo: Repository<Factura>,
  ) {}

  @Post('generar-xml/:facturaId')
  async generarXml(@Param('facturaId') facturaId: string) {
    const xml = await this.sriService.generarXmlFactura(facturaId);
    const xmlPath = await this.sriService.guardarXml(facturaId, xml);
    
    return {
      message: 'XML generado exitosamente',
      facturaId,
      xmlPath,
      xmlPreview: xml.substring(0, 500) + '...',
    };
  }

  @Post('firmar/:facturaId')
  async firmarXml(
    @Param('facturaId') facturaId: string,
    @Body('certificadoId') certificadoId: string,
    @Body('password') password: string,
  ) {
    const factura = await this.facturaRepo.findOne({
      where: { id: facturaId },
    });

    if (!factura || !factura.xmlPath) {
      throw new BadRequestException('Factura no encontrada o XML no generado');
    }

    const certificado = await this.certificadoRepo.findOne({
      where: { id: certificadoId },
    });

    if (!certificado) {
      throw new BadRequestException('Certificado no encontrado');
    }

    const passwordValida = await bcrypt.compare(password, certificado.passwordEncriptada);
    if (!passwordValida) {
      throw new BadRequestException('Contraseña de certificado incorrecta');
    }

    const xmlFirmadoPath = await this.firmaService.firmarXml(
      factura.xmlPath,
      certificado.rutaArchivo,
      password,
    );

    factura.estado = 'FIRMADA' as any;
    await this.facturaRepo.save(factura);

    return {
      message: 'XML firmado exitosamente',
      facturaId,
      xmlFirmadoPath,
    };
  }

  @Get('descargar-xml/:facturaId')
  async descargarXml(@Param('facturaId') facturaId: string) {
    const factura = await this.facturaRepo.findOne({
      where: { id: facturaId },
    });

    if (!factura || !factura.xmlPath) {
      throw new BadRequestException('XML no encontrado');
    }

    const xml = fs.readFileSync(factura.xmlPath, 'utf8');
    return { xml };
  }

  @Post('validar-certificado')
  async validarCertificado(
    @Body('rutaCertificado') rutaCertificado: string,
    @Body('password') password: string,
  ) {
    return this.firmaService.validarCertificado(rutaCertificado, password);
  }

  @Get('verificar-firma/:facturaId')
  async verificarFirma(@Param('facturaId') facturaId: string) {
    const factura = await this.facturaRepo.findOne({
      where: { id: facturaId },
    });

    if (!factura || !factura.xmlPath) {
      throw new BadRequestException('Factura o XML no encontrado');
    }

    const xmlFirmadoPath = factura.xmlPath.replace('.xml', '-firmado.xml');
    
    if (!fs.existsSync(xmlFirmadoPath)) {
      throw new BadRequestException('XML firmado no encontrado');
    }

    const firmaValida = this.firmaService.verificarFirma(xmlFirmadoPath);
    
    return {
      firmaValida,
      xmlFirmadoPath,
    };
  }

  @Post('generar-ride/:facturaId')
  async generarRide(@Param('facturaId') facturaId: string) {
    const pdfPath = await this.rideService.generarRide(facturaId);
    
    return {
      message: 'RIDE generado exitosamente',
      facturaId,
      pdfPath,
    };
  }

  @Get('descargar-ride/:facturaId')
  async descargarRide(@Param('facturaId') facturaId: string, @Res() res: Response) {
    const factura = await this.facturaRepo.findOne({
      where: { id: facturaId },
    });

    if (!factura || !factura.pdfPath || !fs.existsSync(factura.pdfPath)) {
      throw new BadRequestException('PDF no encontrado. Genere el RIDE primero.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="factura-${factura.numeroComprobante}.pdf"`);
    
    const stream = fs.createReadStream(factura.pdfPath);
    stream.pipe(res);
  }

  @Post('enviar/:facturaId')
  async enviarComprobante(@Param('facturaId') facturaId: string) {
    return this.sriEnvioService.enviarComprobante(facturaId);
  }

  @Post('consultar/:claveAcceso')
  async consultarComprobante(
    @Param('claveAcceso') claveAcceso: string,
    @Body('ambiente') ambiente?: string,
  ) {
    return this.sriEnvioService.consultarComprobante(claveAcceso, ambiente || '01');
  }

  @Get('consultar-ruc/:ruc')
  async consultarRuc(@Param('ruc') ruc: string) {
    return this.sriRucService.consultarRuc(ruc);
  }

  @Post('guardar-datos-ruc')
  async guardarDatosRuc(
    @Body() body: { 
      ruc: string; 
      razonSocial: string; 
      nombreComercial?: string;
      direccion?: string; 
      email?: string; 
      telefono?: string;
      obligadoContabilidad?: boolean;
      tipoContribuyente?: string;
    }
  ) {
    await this.sriRucService.guardarDatosRuc(body.ruc, body);
    return { message: 'Datos guardados correctamente' };
  }
}