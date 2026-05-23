import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura, EstadoFactura } from '../factura/entities/factura.entity';
import * as fs from 'fs';
import * as axios from 'axios';
import * as xml2js from 'xml2js';

// ⚠️ MODO DESARROLLO: cuando es true, simula respuestas del SRI sin conexión real
const MODO_DESARROLLO = true;

@Injectable()
export class SriEnvioService {
  constructor(
    @InjectRepository(Factura)
    private facturaRepo: Repository<Factura>,
  ) {}

  /**
   * Envía el XML firmado al Web Service del SRI.
   * En modo desarrollo (MODO_DESARROLLO = true) simula la recepción y autorización.
   */
  async enviarComprobante(facturaId: string): Promise<any> {
    const factura = await this.facturaRepo.findOne({
      where: { id: facturaId },
      relations: ['empresa'],
    });

    if (!factura) {
      throw new BadRequestException('Factura no encontrada');
    }

    // 🧪 MODO DESARROLLO: simular todo el flujo del SRI localmente
    if (MODO_DESARROLLO) {
      console.log(`[SRI MOCK] Simulando envío de factura ${factura.numeroComprobante}…`);

      // 1. Simular recepción exitosa
      factura.estado = EstadoFactura.ENVIADA;
      await this.facturaRepo.save(factura);

      // 2. Simular autorización automática después de 1 segundo
      setTimeout(async () => {
        try {
          factura.estado = EstadoFactura.AUTORIZADA;
          factura.numeroAutorizacion = factura.claveAcceso; // En esquema offline, clave = autorización
          factura.fechaAutorizacion = new Date();
          await this.facturaRepo.save(factura);
          console.log(`[SRI MOCK] Factura ${factura.numeroComprobante} AUTORIZADA (simulado)`);
        } catch (err) {
          console.error('[SRI MOCK] Error al simular autorización:', err);
        }
      }, 1000);

      return {
        success: true,
        estado: 'RECIBIDA',
        mensaje: 'Comprobante recibido por el SRI (SIMULADO – MODO DESARROLLO)',
      };
    }

    // --- CÓDIGO REAL DE ENVÍO (cuando MODO_DESARROLLO = false) ---
    const xmlFirmadoPath = factura.xmlPath?.replace('.xml', '-firmado.xml');
    
    if (!xmlFirmadoPath || !fs.existsSync(xmlFirmadoPath)) {
      throw new BadRequestException('XML firmado no encontrado. Primero firme el comprobante.');
    }

    const xmlFirmado = fs.readFileSync(xmlFirmadoPath, 'utf8');
    const xmlBase64 = Buffer.from(xmlFirmado).toString('base64');

    const urlRecepcion = factura.ambiente === '01' 
      ? 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl'
      : 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl';

    const soapEnvelope = this.construirSoapEnvelope(xmlBase64);

    try {
      const response = await axios.default.post(urlRecepcion, soapEnvelope, {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': '',
        },
        timeout: 30000,
      });

      const resultado = await this.procesarRespuestaRecepcion(response.data);
      
      factura.estado = resultado.estado;
      
      if (resultado.estado === EstadoFactura.AUTORIZADA) {
        factura.numeroAutorizacion = resultado.numeroAutorizacion;
        factura.fechaAutorizacion = new Date();
      }
      
      if (resultado.mensajeError) {
        factura.mensajeError = resultado.mensajeError;
      }
      
      await this.facturaRepo.save(factura);

      return {
        success: resultado.estado === EstadoFactura.AUTORIZADA,
        estado: resultado.estado,
        numeroAutorizacion: resultado.numeroAutorizacion,
        mensaje: resultado.mensaje,
        mensajeError: resultado.mensajeError,
      };

    } catch (error) {
      factura.estado = EstadoFactura.RECHAZADA;
      factura.mensajeError = error.message;
      await this.facturaRepo.save(factura);
      
      throw new BadRequestException(`Error al enviar al SRI: ${error.message}`);
    }
  }

  /**
   * Consulta el estado de un comprobante por clave de acceso
   */
  async consultarComprobante(claveAcceso: string, ambiente: string = '01'): Promise<any> {
    // 🧪 MODO DESARROLLO: simular consulta
    if (MODO_DESARROLLO) {
      console.log(`[SRI MOCK] Consultando autorización para clave ${claveAcceso}…`);
      const factura = await this.facturaRepo.findOne({ where: { claveAcceso } });
      return {
        estado: factura?.estado === 'AUTORIZADA' ? 'AUTORIZADO' : 'PENDIENTE',
        numeroAutorizacion: factura?.numeroAutorizacion || null,
        mensaje: 'Simulación de consulta (MODO DESARROLLO)',
      };
    }

    const urlAutorizacion = ambiente === '01'
      ? 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl'
      : 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl';

    const soapEnvelope = this.construirSoapConsulta(claveAcceso);

    try {
      const response = await axios.default.post(urlAutorizacion, soapEnvelope, {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': '',
        },
        timeout: 30000,
      });

      return await this.procesarRespuestaAutorizacion(response.data, claveAcceso);

    } catch (error) {
      throw new BadRequestException(`Error al consultar SRI: ${error.message}`);
    }
  }

  private construirSoapEnvelope(xmlBase64: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.recepcion">
  <soapenv:Header/>
  <soapenv:Body>
    <ec:validarComprobante>
      <xml>${xmlBase64}</xml>
    </ec:validarComprobante>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  private construirSoapConsulta(claveAcceso: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.autorizacion">
  <soapenv:Header/>
  <soapenv:Body>
    <ec:autorizacionComprobante>
      <claveAccesoComprobante>${claveAcceso}</claveAccesoComprobante>
    </ec:autorizacionComprobante>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  private async procesarRespuestaRecepcion(xmlRespuesta: string): Promise<any> {
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlRespuesta);
    
    const body = result['soapenv:Envelope']?.['soapenv:Body'];
    const respuesta = body?.['ns2:validarComprobanteResponse'] || body?.['validarComprobanteResponse'];
    const returnValue = respuesta?.return;
    
    const estado = returnValue?.estado;
    
    if (estado === 'RECIBIDA') {
      return {
        estado: EstadoFactura.ENVIADA,
        mensaje: 'Comprobante recibido por el SRI',
      };
    } else if (estado === 'DEVUELTA') {
      const errores = returnValue?.comprobantes?.comprobante?.mensajes?.mensaje;
      const mensajeError = Array.isArray(errores) 
        ? errores.map(e => e.mensaje).join('; ')
        : errores?.mensaje || 'Error desconocido';
      
      return {
        estado: EstadoFactura.RECHAZADA,
        mensajeError,
      };
    }
    
    return {
      estado: EstadoFactura.ENVIADA,
    };
  }

  private async procesarRespuestaAutorizacion(xmlRespuesta: string, claveAcceso: string): Promise<any> {
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlRespuesta);
    
    const body = result['soapenv:Envelope']?.['soapenv:Body'];
    const respuesta = body?.['ns2:autorizacionComprobanteResponse'] || body?.['autorizacionComprobanteResponse'];
    const returnValue = respuesta?.return;
    
    const estado = returnValue?.estado;
    
    if (estado === 'AUTORIZADO') {
      const factura = await this.facturaRepo.findOne({
        where: { claveAcceso },
      });
      
      if (factura) {
        factura.estado = EstadoFactura.AUTORIZADA;
        factura.numeroAutorizacion = returnValue.numeroAutorizacion;
        factura.fechaAutorizacion = new Date(returnValue.fechaAutorizacion);
        await this.facturaRepo.save(factura);
      }
      
      return {
        estado: 'AUTORIZADO',
        numeroAutorizacion: returnValue.numeroAutorizacion,
        fechaAutorizacion: returnValue.fechaAutorizacion,
      };
    } else if (estado === 'NO AUTORIZADO') {
      return {
        estado: 'RECHAZADO',
        mensajeError: returnValue.mensajes?.mensaje || 'Comprobante no autorizado',
      };
    } else if (estado === 'EN PROCESO') {
      return {
        estado: 'PENDIENTE',
        mensaje: 'Comprobante en proceso de autorización',
      };
    }
    
    return { estado };
  }
}