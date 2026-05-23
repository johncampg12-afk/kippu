export class SriXmlBuilder {
  private xml: any;
  private empresa: any;
  private factura: any;

  constructor(empresa: any, factura: any) {
    this.empresa = empresa;
    this.factura = factura;
  }

  build(): string {
    const builder = require('xmlbuilder');
    
    this.xml = builder.create('factura', {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: false,
    });

    this.xml.att('id', 'comprobante');
    this.xml.att('version', '2.1.0');

    this.buildInfoTributaria();
    this.buildInfoFactura();
    this.buildDetalles();
    this.buildInfoAdicional();

    return this.xml.end({ pretty: true });
  }

  private buildInfoTributaria(): void {
    const info = this.xml.ele('infoTributaria');
    info.ele('ambiente', this.factura.ambiente);
    info.ele('tipoEmision', this.factura.tipoEmision);
    info.ele('razonSocial', this.empresa.razonSocial);
    info.ele('nombreComercial', this.empresa.nombreComercial);
    info.ele('ruc', this.empresa.ruc);
    info.ele('claveAcceso', this.factura.claveAcceso);
    info.ele('codDoc', this.factura.tipoDocumento);
    info.ele('estab', this.empresa.codigoEstablecimiento);
    info.ele('ptoEmi', this.empresa.codigoPuntoEmision);
    info.ele('secuencial', this.extraerSecuencial());
    info.ele('dirMatriz', this.empresa.direccionMatriz);
  }

  private buildInfoFactura(): void {
    const info = this.xml.ele('infoFactura');
    info.ele('fechaEmision', this.formatearFecha(this.factura.fechaEmision));
    info.ele('dirEstablecimiento', this.empresa.direccionEstablecimiento || this.empresa.direccionMatriz);
    info.ele('obligadoContabilidad', this.empresa.obligadoContabilidad ? 'SI' : 'NO');
    info.ele('tipoIdentificacionComprador', this.mapearTipoId(this.factura.tipoIdentificacionComprador));
    info.ele('razonSocialComprador', this.factura.razonSocialComprador);
    info.ele('identificacionComprador', this.factura.identificacionComprador);
    info.ele('totalSinImpuestos', Number(this.factura.subtotal).toFixed(2));
    info.ele('totalDescuento', Number(this.factura.totalDescuento).toFixed(2));
    
    this.buildTotalesImpuestos(info);
    
    info.ele('propina', '0.00');
    info.ele('importeTotal', Number(this.factura.total).toFixed(2));
    info.ele('moneda', 'DOLAR');
  }

  private buildTotalesImpuestos(info: any): void {
    const totales = info.ele('totalConImpuestos');
    
    if (Number(this.factura.iva12) > 0) {
      const imp = totales.ele('totalImpuesto');
      imp.ele('codigo', '2');
      imp.ele('codigoPorcentaje', '4'); // 15%
      imp.ele('baseImponible', Number(this.factura.subtotal12).toFixed(2));
      imp.ele('valor', Number(this.factura.iva12).toFixed(2));
    }
    
    if (Number(this.factura.subtotal0) > 0) {
      const imp = totales.ele('totalImpuesto');
      imp.ele('codigo', '2');
      imp.ele('codigoPorcentaje', '0');
      imp.ele('baseImponible', Number(this.factura.subtotal0).toFixed(2));
      imp.ele('valor', '0.00');
    }
  }

  private buildDetalles(): void {
    const detalles = this.xml.ele('detalles');
    
    for (const d of this.factura.detalles) {
      const det = detalles.ele('detalle');
      det.ele('codigoPrincipal', d.codigoProducto);
      det.ele('descripcion', d.nombreProducto);
      det.ele('cantidad', Number(d.cantidad).toFixed(2));
      det.ele('precioUnitario', Number(d.precioUnitario).toFixed(2));
      det.ele('descuento', Number(d.descuento).toFixed(2));
      det.ele('precioTotalSinImpuesto', Number(d.subtotal).toFixed(2));
      
      const impuestos = det.ele('impuestos');
      const imp = impuestos.ele('impuesto');
      imp.ele('codigo', '2');
      imp.ele('codigoPorcentaje', d.codigoIva === '2' ? '4' : '0');
      imp.ele('tarifa', d.codigoIva === '2' ? '15.00' : '0.00');
      imp.ele('baseImponible', Number(d.subtotal).toFixed(2));
      imp.ele('valor', Number(d.valorIva).toFixed(2));
    }
  }

  private buildInfoAdicional(): void {
    const info = this.xml.ele('infoAdicional');
    
    if (this.empresa.email) {
      const campo = info.ele('campoAdicional');
      campo.att('nombre', 'Email');
      campo.text(this.empresa.email);
    }
    
    const campoSistema = info.ele('campoAdicional');
    campoSistema.att('nombre', 'Sistema');
    campoSistema.text('Holded EC v1.0');
  }

  private extraerSecuencial(): string {
    const partes = this.factura.numeroComprobante.split('-');
    return partes[2] || '000000001';
  }

  private formatearFecha(fecha: Date): string {
    const d = new Date(fecha);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  private mapearTipoId(tipo: string): string {
    const mapa: Record<string, string> = {
      'RUC': '04',
      'CEDULA': '05',
      'PASAPORTE': '06',
      'CONSUMIDOR_FINAL': '07',
    };
    return mapa[tipo] || '07';
  }
}