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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empresa = void 0;
const typeorm_1 = require("typeorm");
let Empresa = class Empresa {
    id;
    ruc;
    razonSocial;
    nombreComercial;
    direccionMatriz;
    direccionEstablecimiento;
    codigoEstablecimiento;
    codigoPuntoEmision;
    obligadoContabilidad;
    contribuyenteEspecial;
    regimenMicroempresas;
    agenteRetencion;
    telefono;
    email;
    logoUrl;
    activo;
    createdAt;
    updatedAt;
};
exports.Empresa = Empresa;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Empresa.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 13 }),
    __metadata("design:type", String)
], Empresa.prototype, "ruc", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300 }),
    __metadata("design:type", String)
], Empresa.prototype, "razonSocial", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300 }),
    __metadata("design:type", String)
], Empresa.prototype, "nombreComercial", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300 }),
    __metadata("design:type", String)
], Empresa.prototype, "direccionMatriz", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300, nullable: true }),
    __metadata("design:type", String)
], Empresa.prototype, "direccionEstablecimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Empresa.prototype, "codigoEstablecimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Empresa.prototype, "codigoPuntoEmision", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Empresa.prototype, "obligadoContabilidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Empresa.prototype, "contribuyenteEspecial", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Empresa.prototype, "regimenMicroempresas", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Empresa.prototype, "agenteRetencion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Empresa.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Empresa.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Empresa.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Empresa.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Empresa.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Empresa.prototype, "updatedAt", void 0);
exports.Empresa = Empresa = __decorate([
    (0, typeorm_1.Entity)('empresas')
], Empresa);
//# sourceMappingURL=empresa.entity.js.map