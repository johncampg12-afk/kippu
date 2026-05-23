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
exports.RideService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const factura_entity_1 = require("../factura/entities/factura.entity");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PDFDocument = require('pdfkit');
let RideService = class RideService {
    facturaRepo;
    constructor(facturaRepo) {
        this.facturaRepo = facturaRepo;
    }
    async generarRide(facturaId) {
        const factura = await this.facturaRepo.findOne({
            where: { id: facturaId },
            relations: ['empresa', 'cliente', 'detalles'],
        });
        if (!factura) {
            throw new Error('Factura no encontrada');
        }
        const empresa = factura.empresa;
        const cliente = factura.cliente;
        const pdfDir = path.join(process.cwd(), 'uploads', 'pdf', factura.empresaId);
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }
        const pdfPath = path.join(pdfDir, `${factura.claveAcceso}.pdf`);
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: `Factura ${factura.numeroComprobante}`,
                Author: empresa.razonSocial,
            }
        });
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);
        if (empresa.logoUrl && fs.existsSync(empresa.logoUrl)) {
            doc.image(empresa.logoUrl, 50, 45, { width: 80 });
        }
        doc.fontSize(18).font('Helvetica-Bold').text(empresa.razonSocial, { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(empresa.nombreComercial, { align: 'center' });
        doc.fontSize(10).text(`RUC: ${empresa.ruc}`, { align: 'center' });
        doc.text(empresa.direccionMatriz, { align: 'center' });
        if (empresa.telefono) {
            doc.text(`Teléfono: ${empresa.telefono}`, { align: 'center' });
        }
        if (empresa.email) {
            doc.text(`Email: ${empresa.email}`, { align: 'center' });
        }
        doc.fontSize(9).text(`OBLIGADO A LLEVAR CONTABILIDAD: ${empresa.obligadoContabilidad ? 'SI' : 'NO'}`, { align: 'center' });
        doc.moveDown(2);
        doc.fontSize(16).font('Helvetica-Bold').text('FACTURA ELECTRÓNICA', { align: 'center' });
        doc.fontSize(12).text(`No. ${factura.numeroComprobante}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(8).font('Helvetica').text(`Clave de Acceso: ${factura.claveAcceso}`, { align: 'center' });
        if (factura.numeroAutorizacion) {
            doc.fontSize(8).text(`No. Autorización: ${factura.numeroAutorizacion}`, { align: 'center' });
            doc.fontSize(8).text(`Fecha de Autorización: ${this.formatearFechaCompleta(factura.fechaAutorizacion)}`, { align: 'center' });
        }
        doc.moveDown(2);
        doc.fontSize(10).text(`AMBIENTE: ${factura.ambiente === '01' ? 'PRUEBAS' : 'PRODUCCIÓN'}`, 50, doc.y);
        doc.text(`FECHA DE EMISIÓN: ${this.formatearFechaCompleta(factura.fechaEmision)}`, { align: 'right' });
        doc.moveDown(2);
        doc.fontSize(12).font('Helvetica-Bold').text('DATOS DEL COMPRADOR', 50, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Razón Social / Nombres: ${cliente.razonSocial}`);
        doc.text(`Identificación: ${cliente.identificacion} (${this.formatearTipoIdentificacion(cliente.tipoIdentificacion)})`);
        if (cliente.direccion && cliente.direccion !== 'N/A') {
            doc.text(`Dirección: ${cliente.direccion}`);
        }
        if (cliente.telefono && cliente.telefono !== '0000000000') {
            doc.text(`Teléfono: ${cliente.telefono}`);
        }
        if (cliente.email && !cliente.email.includes('consumidor@final')) {
            doc.text(`Email: ${cliente.email}`);
        }
        doc.moveDown(2);
        this.generarTablaDetalles(doc, factura);
        doc.moveDown(2);
        this.generarTotales(doc, factura);
        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica').text('Información Adicional:', 50, doc.y);
        doc.fontSize(9).text(`Sistema: Facturación Ecuador v1.0 - 2026`);
        doc.text(`Documento generado electrónicamente`);
        if (factura.numeroAutorizacion) {
            doc.moveDown();
            doc.fontSize(8).text(`URL Verificación: https://celcer.sri.gob.ec/comprobantes-electronicos/consultar?clave=${factura.claveAcceso}`, {
                link: `https://celcer.sri.gob.ec/comprobantes-electronicos/consultar?clave=${factura.claveAcceso}`,
                underline: true,
                color: 'blue',
            });
        }
        doc.fontSize(8).text(`Este documento es una representación impresa de un comprobante electrónico.`, 50, doc.page.height - 50, { align: 'center' });
        doc.end();
        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                factura.pdfPath = pdfPath;
                this.facturaRepo.save(factura);
                resolve(pdfPath);
            });
            stream.on('error', reject);
        });
    }
    generarTablaDetalles(doc, factura) {
        const startY = doc.y;
        const tableTop = startY;
        const colWidths = {
            codigo: 60,
            descripcion: 180,
            cantidad: 60,
            precioUnitario: 80,
            descuento: 60,
            total: 80,
        };
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Código', 50, tableTop);
        doc.text('Descripción', 50 + colWidths.codigo, tableTop);
        doc.text('Cantidad', 50 + colWidths.codigo + colWidths.descripcion, tableTop, { align: 'right', width: colWidths.cantidad });
        doc.text('P. Unit.', 50 + colWidths.codigo + colWidths.descripcion + colWidths.cantidad, tableTop, { align: 'right', width: colWidths.precioUnitario });
        doc.text('Desc.', 50 + colWidths.codigo + colWidths.descripcion + colWidths.cantidad + colWidths.precioUnitario, tableTop, { align: 'right', width: colWidths.descuento });
        doc.text('Total', 50 + colWidths.codigo + colWidths.descripcion + colWidths.cantidad + colWidths.precioUnitario + colWidths.descuento, tableTop, { align: 'right', width: colWidths.total });
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica');
        let currentY = doc.y;
        for (const detalle of factura.detalles) {
            if (currentY > doc.page.height - 150) {
                doc.addPage();
                currentY = 50;
            }
            doc.text(detalle.codigoProducto, 50, currentY);
            doc.text(detalle.nombreProducto, 50 + colWidths.codigo, currentY, { width: colWidths.descripcion });
            doc.text(Number(detalle.cantidad).toFixed(2), 50 + colWidths.codigo + colWidths.descripcion, currentY, { align: 'right', width: colWidths.cantidad });
            doc.text(`$${Number(detalle.precioUnitario).toFixed(2)}`, 50 + colWidths.codigo + colWidths.descripcion + colWidths.cantidad, currentY, { align: 'right', width: colWidths.precioUnitario });
            doc.text(`$${Number(detalle.descuento).toFixed(2)}`, 50 + colWidths.codigo + colWidths.descripcion + colWidths.cantidad + colWidths.precioUnitario, currentY, { align: 'right', width: colWidths.descuento });
            doc.text(`$${Number(detalle.subtotal).toFixed(2)}`, 50 + colWidths.codigo + colWidths.descripcion + colWidths.cantidad + colWidths.precioUnitario + colWidths.descuento, currentY, { align: 'right', width: colWidths.total });
            currentY += 20;
        }
        doc.moveDown(0.5);
        doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
        doc.y = currentY + 10;
    }
    generarTotales(doc, factura) {
        const startX = 350;
        const lineHeight = 20;
        doc.fontSize(10);
        doc.font('Helvetica').text('Subtotal 15%:', startX, doc.y);
        doc.font('Helvetica-Bold').text(`$${Number(factura.subtotal12).toFixed(2)}`, startX + 150, doc.y - lineHeight, { align: 'right', width: 80 });
        if (Number(factura.subtotal0) > 0) {
            doc.font('Helvetica').text('Subtotal 0%:', startX, doc.y);
            doc.font('Helvetica-Bold').text(`$${Number(factura.subtotal0).toFixed(2)}`, startX + 150, doc.y - lineHeight, { align: 'right', width: 80 });
        }
        if (Number(factura.iva12) > 0) {
            doc.font('Helvetica').text('IVA 15%:', startX, doc.y);
            doc.font('Helvetica-Bold').text(`$${Number(factura.iva12).toFixed(2)}`, startX + 150, doc.y - lineHeight, { align: 'right', width: 80 });
        }
        if (Number(factura.totalDescuento) > 0) {
            doc.font('Helvetica').text('Descuento:', startX, doc.y);
            doc.font('Helvetica-Bold').text(`$${Number(factura.totalDescuento).toFixed(2)}`, startX + 150, doc.y - lineHeight, { align: 'right', width: 80 });
        }
        doc.moveDown(0.5);
        doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold').text('TOTAL:', startX, doc.y);
        doc.text(`$${Number(factura.total).toFixed(2)}`, startX + 150, doc.y - 18, { align: 'right', width: 80 });
    }
    formatearFechaCompleta(fecha) {
        if (!fecha)
            return '';
        const d = new Date(fecha);
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    formatearTipoIdentificacion(tipo) {
        const mapa = {
            'RUC': 'RUC',
            'CEDULA': 'Cédula',
            'PASAPORTE': 'Pasaporte',
            'CONSUMIDOR_FINAL': 'Consumidor Final',
        };
        return mapa[tipo] || tipo;
    }
};
exports.RideService = RideService;
exports.RideService = RideService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RideService);
//# sourceMappingURL=ride.service.js.map