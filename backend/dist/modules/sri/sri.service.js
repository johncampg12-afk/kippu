"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SriService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const factura_entity_1 = require("../factura/entities/factura.entity");
const empresa_entity_1 = require("../empresa/entities/empresa.entity");
const xmlbuilder = __importStar(require("xmlbuilder"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let SriService = class SriService {
    facturaRepo;
    empresaRepo;
    constructor(facturaRepo, empresaRepo) {
        this.facturaRepo = facturaRepo;
        this.empresaRepo = empresaRepo;
    }
    async generarXmlFactura(facturaId) {
        const factura = await this.facturaRepo.findOne({
            where: { id: facturaId },
            relations: ['empresa', 'cliente', 'detalles'],
        });
        if (!factura) {
            throw new Error('Factura no encontrada');
        }
        const empresa = factura.empresa;
        const xml = xmlbuilder.create('factura', {
            version: '1.0',
            encoding: 'UTF-8',
            standalone: false,
        });
        xml.att('id', 'comprobante');
        xml.att('version', '2.1.0');
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
        const infoFactura = xml.ele('infoFactura');
        infoFactura.ele('fechaEmision', this.formatearFecha(factura.fechaEmision));
        infoFactura.ele('dirEstablecimiento', empresa.direccionEstablecimiento || empresa.direccionMatriz);
        if (empresa.contribuyenteEspecial) {
            infoFactura.ele('contribuyenteEspecial', empresa.contribuyenteEspecial);
        }
        infoFactura.ele('obligadoContabilidad', empresa.obligadoContabilidad ? 'SI' : 'NO');
        infoFactura.ele('tipoIdentificacionComprador', this.mapearTipoIdentificacion(factura.tipoIdentificacionComprador));
        infoFactura.ele('razonSocialComprador', factura.razonSocialComprador);
        infoFactura.ele('identificacionComprador', factura.identificacionComprador);
        if (factura.direccionComprador && factura.direccionComprador !== 'N/A') {
            infoFactura.ele('direccionComprador', factura.direccionComprador);
        }
        infoFactura.ele('totalSinImpuestos', Number(factura.subtotal).toFixed(2));
        infoFactura.ele('totalDescuento', Number(factura.totalDescuento).toFixed(2));
        const totalConImpuestos = infoFactura.ele('totalConImpuestos');
        if (Number(factura.iva12) > 0) {
            const totalImpuesto = totalConImpuestos.ele('totalImpuesto');
            totalImpuesto.ele('codigo', '2');
            totalImpuesto.ele('codigoPorcentaje', '4');
            totalImpuesto.ele('baseImponible', Number(factura.subtotal12).toFixed(2));
            totalImpuesto.ele('valor', Number(factura.iva12).toFixed(2));
        }
        if (Number(factura.subtotal0) > 0) {
            const totalImpuesto = totalConImpuestos.ele('totalImpuesto');
            totalImpuesto.ele('codigo', '2');
            totalImpuesto.ele('codigoPorcentaje', '0');
            totalImpuesto.ele('baseImponible', Number(factura.subtotal0).toFixed(2));
            totalImpuesto.ele('valor', '0.00');
        }
        if (Number(factura.subtotalNoIva) > 0) {
            const totalImpuesto = totalConImpuestos.ele('totalImpuesto');
            totalImpuesto.ele('codigo', '2');
            totalImpuesto.ele('codigoPorcentaje', '6');
            totalImpuesto.ele('baseImponible', Number(factura.subtotalNoIva).toFixed(2));
            totalImpuesto.ele('valor', '0.00');
        }
        if (Number(factura.ice) > 0) {
            const totalImpuestoICE = totalConImpuestos.ele('totalImpuesto');
            totalImpuestoICE.ele('codigo', '3');
            totalImpuestoICE.ele('codigoPorcentaje', '0');
            totalImpuestoICE.ele('baseImponible', Number(factura.subtotal12).toFixed(2));
            totalImpuestoICE.ele('valor', Number(factura.ice).toFixed(2));
        }
        infoFactura.ele('propina', '0.00');
        infoFactura.ele('importeTotal', Number(factura.total).toFixed(2));
        infoFactura.ele('moneda', factura.moneda || 'DOLAR');
        const detalles = xml.ele('detalles');
        for (const detalle of factura.detalles) {
            const detalleXml = detalles.ele('detalle');
            detalleXml.ele('codigoPrincipal', detalle.codigoProducto);
            detalleXml.ele('descripcion', detalle.nombreProducto);
            detalleXml.ele('cantidad', Number(detalle.cantidad).toFixed(2));
            detalleXml.ele('precioUnitario', Number(detalle.precioUnitario).toFixed(2));
            detalleXml.ele('descuento', Number(detalle.descuento).toFixed(2));
            detalleXml.ele('precioTotalSinImpuesto', Number(detalle.subtotal).toFixed(2));
            const impuestosDetalle = detalleXml.ele('impuestos');
            const impuesto = impuestosDetalle.ele('impuesto');
            impuesto.ele('codigo', '2');
            const mapeo = this.mapearCodigoIva(detalle.codigoIva);
            impuesto.ele('codigoPorcentaje', mapeo.codigoPorcentaje);
            impuesto.ele('tarifa', mapeo.tarifa);
            impuesto.ele('baseImponible', Number(detalle.subtotal).toFixed(2));
            impuesto.ele('valor', Number(detalle.valorIva).toFixed(2));
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
        return xml.end({ pretty: true });
    }
    mapearCodigoIva(codigoInterno) {
        switch (codigoInterno) {
            case '2':
                return { codigoPorcentaje: '4', tarifa: '15.00' };
            case '0':
                return { codigoPorcentaje: '0', tarifa: '0.00' };
            case '6':
                return { codigoPorcentaje: '6', tarifa: '0.00' };
            case '7':
                return { codigoPorcentaje: '7', tarifa: '0.00' };
            default:
                return { codigoPorcentaje: '4', tarifa: '15.00' };
        }
    }
    mapearTipoIdentificacion(tipo) {
        const mapa = {
            'RUC': '04',
            'CEDULA': '05',
            'PASAPORTE': '06',
            'CONSUMIDOR_FINAL': '07',
            'IDENTIFICACION_EXTERIOR': '08',
        };
        return mapa[tipo] || '07';
    }
    extraerSecuencial(numeroComprobante) {
        const partes = numeroComprobante.split('-');
        return partes[2] || '000000001';
    }
    formatearFecha(fecha) {
        const d = new Date(fecha);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
    }
    async guardarXml(facturaId, xml) {
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
};
exports.SriService = SriService;
exports.SriService = SriService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __param(1, (0, typeorm_1.InjectRepository)(empresa_entity_1.Empresa)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SriService);
//# sourceMappingURL=sri.service.js.map