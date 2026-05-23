import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from '../factura/entities/factura.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import * as xmlbuilder from 'xmlbuilder';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SriService {
  constructor(
    @InjectRepository(Factura)
    private facturaRepo: Repository<Factura>,
    @InjectRepository(Empresa)
    private empresaRepo: Repository<Empresa>,
  ) {}

  /**
   * Genera el XML de la factura según el formato oficial del SRI Ecuador v2.1.0
   * con los códigos de tarifa actualizados al 15% (2026)
   */
  async generarXmlFactura(facturaId: string): Promise<string> {
    const factura = await this.facturaRepo.findOne({
      where: { id: facturaId },
      relations: ['empresa', 'cliente', 'detalles'],
    });

    if (!factura) {
      throw new Error('Factura no encontrada');
    }

    const empresa = factura.empresa;

    // Crear estructura XML según especificación SRI v2.1.0
    const xml = xmlbuilder.create('factura', {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: false,
    });

    // Atributos principales del comprobante
    xml.att('id', 'comprobante');
    xml.att('version', '2.1.0');

    // =============================================
    // 1. INFORMACIÓN TRIBUTARIA
    // =============================================
    const infoTributaria = xml.ele('infoTributaria');
    infoTributaria.ele('ambiente', factura.ambiente);
    infoTributaria.ele('tipoEmision', factura.tipoEmision);
    infoTributaria.ele('razonSocial', empresa.razonSocial);
    infoTributaria.ele('nombreComercial', empresa.nombreComercial);
    infoTributaria.ele('ruc', empresa.ruc);
    infoTributaria.ele('claveAcceso', factura.claveAcceso);
    infoTributaria.ele('codDoc', factura.tipoDocumento);
    infoTributaria.ele('estab', empresa.codigoEstablecimiento);
    infoTributaria.ele('ptoEmi', empresa.codigoPuntoEmision);
    infoTributaria.ele('secuencial', this.extraerSecuencial(factura.numeroComprobante));
    infoTributaria.ele('dirMatriz', empresa.direccionMatriz);

    // =============================================
    // 2. INFORMACIÓN DE LA FACTURA
    // =============================================
    const infoFactura = xml.ele('infoFactura');
    infoFactura.ele('fechaEmision', this.formatearFecha(factura.fechaEmision));
    infoFactura.ele('dirEstablecimiento', empresa.direccionEstablecimiento || empresa.direccionMatriz);
    
    if (empresa.contribuyenteEspecial) {
      infoFactura.ele('contribuyenteEspecial', empresa.contribuyenteEspecial);
    }
    
    infoFactura.ele('obligadoContabilidad', empresa.obligadoContabilidad ? 'SI' : 'NO');
    
    // Datos del comprador
    infoFactura.ele('tipoIdentificacionComprador', this.mapearTipoIdentificacion(factura.tipoIdentificacionComprador));
    infoFactura.ele('razonSocialComprador', factura.razonSocialComprador);
    infoFactura.ele('identificacionComprador', factura.identificacionComprador);
    
    if (factura.direccionComprador && factura.direccionComprador !== 'N/A') {
      infoFactura.ele('direccionComprador', factura.direccionComprador);
    }

    infoFactura.ele('totalSinImpuestos', Number(factura.subtotal).toFixed(2));
    infoFactura.ele('totalDescuento', Number(factura.totalDescuento).toFixed(2));

    // =============================================
    // 3. TOTALES CON IMPUESTOS (CÓDIGOS ACTUALIZADOS)
    // =============================================
    const totalConImpuestos = infoFactura.ele('totalConImpuestos');
    
    // IVA 15% (Código de porcentaje: 4 según tabla SRI)
    if (Number(factura.iva12) > 0) {
      const totalImpuesto = totalConImpuestos.ele('totalImpuesto');
      totalImpuesto.ele('codigo', '2'); // Impuesto IVA
      totalImpuesto.ele('codigoPorcentaje', '4'); // Tarifa 15% (Actualizado)
      totalImpuesto.ele('baseImponible', Number(factura.subtotal12).toFixed(2));
      totalImpuesto.ele('valor', Number(factura.iva12).toFixed(2));
    }
    
    // IVA 0% (Código de porcentaje: 0)
    if (Number(factura.subtotal0) > 0) {
      const totalImpuesto = totalConImpuestos.ele('totalImpuesto');
      totalImpuesto.ele('codigo', '2');
      totalImpuesto.ele('codigoPorcentaje', '0');
      totalImpuesto.ele('baseImponible', Number(factura.subtotal0).toFixed(2));
      totalImpuesto.ele('valor', '0.00');
    }
    
    // No objeto de IVA (Código de porcentaje: 6)
    if (Number(factura.subtotalNoIva) > 0) {
      const totalImpuesto = totalConImpuestos.ele('totalImpuesto');
      totalImpuesto.ele('codigo', '2');
      totalImpuesto.ele('codigoPorcentaje', '6');
      totalImpuesto.ele('baseImponible', Number(factura.subtotalNoIva).toFixed(2));
      totalImpuesto.ele('valor', '0.00');
    }

    // ICE (si aplica)
    if (Number(factura.ice) > 0) {
      const totalImpuestoICE = totalConImpuestos.ele('totalImpuesto');
      totalImpuestoICE.ele('codigo', '3'); // ICE
      totalImpuestoICE.ele('codigoPorcentaje', '0');
      totalImpuestoICE.ele('baseImponible', Number(factura.subtotal12).toFixed(2));
      totalImpuestoICE.ele('valor', Number(factura.ice).toFixed(2));
    }

    infoFactura.ele('propina', '0.00');
    infoFactura.ele('importeTotal', Number(factura.total).toFixed(2));
    infoFactura.ele('moneda', factura.moneda || 'DOLAR');

    // =============================================
    // 4. DETALLES DE LA FACTURA
    // =============================================
    const detalles = xml.ele('detalles');
    
    for (const detalle of factura.detalles) {
      const detalleXml = detalles.ele('detalle');
      
      detalleXml.ele('codigoPrincipal', detalle.codigoProducto);
      detalleXml.ele('descripcion', detalle.nombreProducto);
      detalleXml.ele('cantidad', Number(detalle.cantidad).toFixed(2));
      detalleXml.ele('precioUnitario', Number(detalle.precioUnitario).toFixed(2));
      detalleXml.ele('descuento', Number(detalle.descuento).toFixed(2));
      detalleXml.ele('precioTotalSinImpuesto', Number(detalle.subtotal).toFixed(2));
      
      // Impuestos del detalle
      const impuestosDetalle = detalleXml.ele('impuestos');
      const impuesto = impuestosDetalle.ele('impuesto');
      
      impuesto.ele('codigo', '2'); // IVA
      
      // Mapear código interno a código SRI actualizado
      const mapeo = this.mapearCodigoIva(detalle.codigoIva);
      impuesto.ele('codigoPorcentaje', mapeo.codigoPorcentaje);
      impuesto.ele('tarifa', mapeo.tarifa);
      impuesto.ele('baseImponible', Number(detalle.subtotal).toFixed(2));
      impuesto.ele('valor', Number(detalle.valorIva).toFixed(2));

      // ICE en detalle (si aplica)
      if (detalle.codigoIce && Number(detalle.valorIce) > 0) {
        const impuestosDetalleICE = detalleXml.ele('impuestos');
        const impuestoICE = impuestosDetalleICE.ele('impuesto');
        impuestoICE.ele('codigo', '3');
        impuestoICE.ele('codigoPorcentaje', detalle.codigoIce);
        impuestoICE.ele('tarifa', '0.00');
        impuestoICE.ele('baseImponible', Number(detalle.subtotal).toFixed(2));
        impuestoICE.ele('valor', Number(detalle.valorIce).toFixed(2));
      }
    }

    // =============================================
    // 5. INFORMACIÓN ADICIONAL (OPCIONAL)
    // =============================================
    const infoAdicional = xml.ele('infoAdicional');
    
    if (empresa.email) {
      const campo = infoAdicional.ele('campoAdicional');
      campo.att('nombre', 'Email');
      campo.text(empresa.email);
    }
    
    if (empresa.telefono) {
      const campo = infoAdicional.ele('campoAdicional');
      campo.att('nombre', 'Teléfono');
      campo.text(empresa.telefono);
    }

    const campoSistema = infoAdicional.ele('campoAdicional');
    campoSistema.att('nombre', 'Sistema');
    campoSistema.text('Facturación Ecuador v1.0 - 2026');

    // Devolver XML formateado
    return xml.end({ pretty: true });
  }

  /**
   * Mapea el código de IVA interno a los códigos oficiales del SRI 2026
   */
  private mapearCodigoIva(codigoInterno: string): { codigoPorcentaje: string; tarifa: string } {
    switch (codigoInterno) {
      case '2': // 15% IVA (anteriormente 12%)
        return { codigoPorcentaje: '4', tarifa: '15.00' };
      case '0': // 0% IVA
        return { codigoPorcentaje: '0', tarifa: '0.00' };
      case '6': // No objeto de IVA
        return { codigoPorcentaje: '6', tarifa: '0.00' };
      case '7': // Exento de IVA
        return { codigoPorcentaje: '7', tarifa: '0.00' };
      default:
        return { codigoPorcentaje: '4', tarifa: '15.00' }; // Por defecto 15%
    }
  }

  /**
   * Mapea el tipo de identificación a códigos SRI
   */
  private mapearTipoIdentificacion(tipo: string): string {
    const mapa: Record<string, string> = {
      'RUC': '04',
      'CEDULA': '05',
      'PASAPORTE': '06',
      'CONSUMIDOR_FINAL': '07',
      'IDENTIFICACION_EXTERIOR': '08',
    };
    return mapa[tipo] || '07'; // Por defecto Consumidor Final
  }

  private extraerSecuencial(numeroComprobante: string): string {
    const partes = numeroComprobante.split('-');
    return partes[2] || '000000001';
  }

  private formatearFecha(fecha: Date): string {
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  async guardarXml(facturaId: string, xml: string): Promise<string> {
    const factura = await this.facturaRepo.findOne({
      where: { id: facturaId },
    });

    if (!factura) {
      throw new Error('Factura no encontrada');
    }

    const xmlDir = path.join(process.cwd(), 'uploads', 'xml', factura.empresaId);
    if (!fs.existsSync(xmlDir)) {
      fs.mkdirSync(xmlDir, { recursive: true });
    }

    const xmlPath = path.join(xmlDir, `${factura.claveAcceso}.xml`);
    fs.writeFileSync(xmlPath, xml, 'utf8');

    factura.xmlPath = xmlPath;
    await this.facturaRepo.save(factura);
    
    return xmlPath;
  }
}