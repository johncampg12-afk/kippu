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
exports.SriController = void 0;
const common_1 = require("@nestjs/common");
const sri_service_1 = require("./sri.service");
const firma_electronica_service_1 = require("./firma-electronica.service");
const ride_service_1 = require("./ride.service");
const sri_envio_service_1 = require("./sri-envio.service");
const sri_ruc_service_1 = require("./sri-ruc.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const certificado_entity_1 = require("../certificado/entities/certificado.entity");
const factura_entity_1 = require("../factura/entities/factura.entity");
const fs = __importStar(require("fs"));
const bcrypt = __importStar(require("bcrypt"));
let SriController = class SriController {
    sriService;
    firmaService;
    rideService;
    sriEnvioService;
    sriRucService;
    certificadoRepo;
    facturaRepo;
    constructor(sriService, firmaService, rideService, sriEnvioService, sriRucService, certificadoRepo, facturaRepo) {
        this.sriService = sriService;
        this.firmaService = firmaService;
        this.rideService = rideService;
        this.sriEnvioService = sriEnvioService;
        this.sriRucService = sriRucService;
        this.certificadoRepo = certificadoRepo;
        this.facturaRepo = facturaRepo;
    }
    async generarXml(facturaId) {
        const xml = await this.sriService.generarXmlFactura(facturaId);
        const xmlPath = await this.sriService.guardarXml(facturaId, xml);
        return {
            message: 'XML generado exitosamente',
            facturaId,
            xmlPath,
            xmlPreview: xml.substring(0, 500) + '...',
        };
    }
    async firmarXml(facturaId, certificadoId, password) {
        const factura = await this.facturaRepo.findOne({
            where: { id: facturaId },
        });
        if (!factura || !factura.xmlPath) {
            throw new common_1.BadRequestException('Factura no encontrada o XML no generado');
        }
        const certificado = await this.certificadoRepo.findOne({
            where: { id: certificadoId },
        });
        if (!certificado) {
            throw new common_1.BadRequestException('Certificado no encontrado');
        }
        const passwordValida = await bcrypt.compare(password, certificado.passwordEncriptada);
        if (!passwordValida) {
            throw new common_1.BadRequestException('Contraseña de certificado incorrecta');
        }
        const xmlFirmadoPath = await this.firmaService.firmarXml(factura.xmlPath, certificado.rutaArchivo, password);
        factura.estado = 'FIRMADA';
        await this.facturaRepo.save(factura);
        return {
            message: 'XML firmado exitosamente',
            facturaId,
            xmlFirmadoPath,
        };
    }
    async descargarXml(facturaId) {
        const factura = await this.facturaRepo.findOne({
            where: { id: facturaId },
        });
        if (!factura || !factura.xmlPath) {
            throw new common_1.BadRequestException('XML no encontrado');
        }
        const xml = fs.readFileSync(factura.xmlPath, 'utf8');
        return { xml };
    }
    async validarCertificado(rutaCertificado, password) {
        return this.firmaService.validarCertificado(rutaCertificado, password);
    }
    async verificarFirma(facturaId) {
        const factura = await this.facturaRepo.findOne({
            where: { id: facturaId },
        });
        if (!factura || !factura.xmlPath) {
            throw new common_1.BadRequestException('Factura o XML no encontrado');
        }
        const xmlFirmadoPath = factura.xmlPath.replace('.xml', '-firmado.xml');
        if (!fs.existsSync(xmlFirmadoPath)) {
            throw new common_1.BadRequestException('XML firmado no encontrado');
        }
        const firmaValida = this.firmaService.verificarFirma(xmlFirmadoPath);
        return {
            firmaValida,
            xmlFirmadoPath,
        };
    }
    async generarRide(facturaId) {
        const pdfPath = await this.rideService.generarRide(facturaId);
        return {
            message: 'RIDE generado exitosamente',
            facturaId,
            pdfPath,
        };
    }
    async descargarRide(facturaId, res) {
        const factura = await this.facturaRepo.findOne({
            where: { id: facturaId },
        });
        if (!factura || !factura.pdfPath || !fs.existsSync(factura.pdfPath)) {
            throw new common_1.BadRequestException('PDF no encontrado. Genere el RIDE primero.');
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="factura-${factura.numeroComprobante}.pdf"`);
        const stream = fs.createReadStream(factura.pdfPath);
        stream.pipe(res);
    }
    async enviarComprobante(facturaId) {
        return this.sriEnvioService.enviarComprobante(facturaId);
    }
    async consultarComprobante(claveAcceso, ambiente) {
        return this.sriEnvioService.consultarComprobante(claveAcceso, ambiente || '01');
    }
    async consultarRuc(ruc) {
        return this.sriRucService.consultarRuc(ruc);
    }
    async guardarDatosRuc(body) {
        await this.sriRucService.guardarDatosRuc(body.ruc, body);
        return { message: 'Datos guardados correctamente' };
    }
};
exports.SriController = SriController;
__decorate([
    (0, common_1.Post)('generar-xml/:facturaId'),
    __param(0, (0, common_1.Param)('facturaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "generarXml", null);
__decorate([
    (0, common_1.Post)('firmar/:facturaId'),
    __param(0, (0, common_1.Param)('facturaId')),
    __param(1, (0, common_1.Body)('certificadoId')),
    __param(2, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "firmarXml", null);
__decorate([
    (0, common_1.Get)('descargar-xml/:facturaId'),
    __param(0, (0, common_1.Param)('facturaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "descargarXml", null);
__decorate([
    (0, common_1.Post)('validar-certificado'),
    __param(0, (0, common_1.Body)('rutaCertificado')),
    __param(1, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "validarCertificado", null);
__decorate([
    (0, common_1.Get)('verificar-firma/:facturaId'),
    __param(0, (0, common_1.Param)('facturaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "verificarFirma", null);
__decorate([
    (0, common_1.Post)('generar-ride/:facturaId'),
    __param(0, (0, common_1.Param)('facturaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "generarRide", null);
__decorate([
    (0, common_1.Get)('descargar-ride/:facturaId'),
    __param(0, (0, common_1.Param)('facturaId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "descargarRide", null);
__decorate([
    (0, common_1.Post)('enviar/:facturaId'),
    __param(0, (0, common_1.Param)('facturaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "enviarComprobante", null);
__decorate([
    (0, common_1.Post)('consultar/:claveAcceso'),
    __param(0, (0, common_1.Param)('claveAcceso')),
    __param(1, (0, common_1.Body)('ambiente')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "consultarComprobante", null);
__decorate([
    (0, common_1.Get)('consultar-ruc/:ruc'),
    __param(0, (0, common_1.Param)('ruc')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "consultarRuc", null);
__decorate([
    (0, common_1.Post)('guardar-datos-ruc'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "guardarDatosRuc", null);
exports.SriController = SriController = __decorate([
    (0, common_1.Controller)('sri'),
    __param(5, (0, typeorm_1.InjectRepository)(certificado_entity_1.Certificado)),
    __param(6, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __metadata("design:paramtypes", [sri_service_1.SriService,
        firma_electronica_service_1.FirmaElectronicaService,
        ride_service_1.RideService,
        sri_envio_service_1.SriEnvioService,
        sri_ruc_service_1.SriRucService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SriController);
//# sourceMappingURL=sri.controller.js.map