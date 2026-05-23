export declare class SriXmlBuilder {
    private xml;
    private empresa;
    private factura;
    constructor(empresa: any, factura: any);
    build(): string;
    private buildInfoTributaria;
    private buildInfoFactura;
    private buildTotalesImpuestos;
    private buildDetalles;
    private buildInfoAdicional;
    private extraerSecuencial;
    private formatearFecha;
    private mapearTipoId;
}
