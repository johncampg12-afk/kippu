"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificadoController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const certificado_service_1 = require("./certificado.service");
const multer_1 = require("multer");
const path_1 = require("path");
let CertificadoController = class CertificadoController {
    certificadoService;
    constructor(certificadoService) {
        this.certificadoService = certificadoService;
    }
    async uploadCertificado(file, password, esProduccion, empresaId) {
        return this.certificadoService.uploadCertificado(file, password, empresaId, esProduccion === 'true');
    }
};
exports.CertificadoController = CertificadoController;
__decorate([
    (0, common_1.Post)('upload/:empresaId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/temp',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, file.fieldname + '-' + uniqueSuffix + (0, path_1.extname)(file.originalname));
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.originalname.match(/\.(p12|pfx)$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Solo se permiten archivos .p12 o .pfx'), false);
            }
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('password')),
    __param(2, (0, common_1.Body)('esProduccion')),
    __param(3, (0, common_1.Param)('empresaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], CertificadoController.prototype, "uploadCertificado", null);
exports.CertificadoController = CertificadoController = __decorate([
    (0, common_1.Controller)('certificado'),
    __metadata("design:paramtypes", [certificado_service_1.CertificadoService])
], CertificadoController);
//# sourceMappingURL=certificado.controller.js.map