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
exports.CertificadoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const certificado_entity_1 = require("./entities/certificado.entity");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const forge = __importStar(require("node-forge"));
const bcrypt = __importStar(require("bcrypt"));
let CertificadoService = class CertificadoService {
    certificadoRepo;
    constructor(certificadoRepo) {
        this.certificadoRepo = certificadoRepo;
    }
    async uploadCertificado(file, password, empresaId, esProduccion = false) {
        if (!file) {
            throw new common_1.BadRequestException('Archivo de certificado requerido');
        }
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.p12' && ext !== '.pfx') {
            throw new common_1.BadRequestException('El archivo debe ser .p12 o .pfx');
        }
        try {
            const p12Buffer = fs.readFileSync(file.path);
            const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
            if (!certBags[forge.pki.oids.certBag] || certBags[forge.pki.oids.certBag].length === 0) {
                throw new Error('No se encontró certificado en el archivo');
            }
            const cert = certBags[forge.pki.oids.certBag][0].cert;
            const sujeto = cert.subject.getField('CN')?.value || '';
            const emisor = cert.issuer.getField('CN')?.value || '';
            const fechaEmision = cert.validity.notBefore;
            const fechaExpiracion = cert.validity.notAfter;
            const ahora = new Date();
            if (new Date(fechaExpiracion) < ahora) {
                throw new Error('El certificado está expirado');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const uploadDir = path.join(process.cwd(), 'uploads', 'certificados', empresaId);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const fileName = `${Date.now()}-${file.originalname}`;
            const newPath = path.join(uploadDir, fileName);
            fs.renameSync(file.path, newPath);
            const certificado = this.certificadoRepo.create({
                nombre: file.originalname,
                rutaArchivo: newPath,
                passwordEncriptada: hashedPassword,
                fechaEmision: new Date(fechaEmision),
                fechaExpiracion: new Date(fechaExpiracion),
                emisor,
                sujeto,
                empresaId,
                esProduccion,
                activo: true,
            });
            await this.certificadoRepo.save(certificado);
            return {
                message: 'Certificado subido exitosamente',
                certificado: {
                    id: certificado.id,
                    sujeto: certificado.sujeto,
                    emisor: certificado.emisor,
                    fechaExpiracion: certificado.fechaExpiracion,
                },
            };
        }
        catch (error) {
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            throw new common_1.BadRequestException(`Error al procesar certificado: ${error.message}`);
        }
    }
};
exports.CertificadoService = CertificadoService;
exports.CertificadoService = CertificadoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(certificado_entity_1.Certificado)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CertificadoService);
//# sourceMappingURL=certificado.service.js.map