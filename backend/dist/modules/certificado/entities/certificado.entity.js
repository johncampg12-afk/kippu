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
exports.Certificado = void 0;
const typeorm_1 = require("typeorm");
const empresa_entity_1 = require("../../empresa/entities/empresa.entity");
let Certificado = class Certificado {
    id;
    nombre;
    rutaArchivo;
    passwordEncriptada;
    fechaEmision;
    fechaExpiracion;
    emisor;
    sujeto;
    activo;
    esProduccion;
    empresa;
    empresaId;
    createdAt;
    updatedAt;
};
exports.Certificado = Certificado;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Certificado.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300 }),
    __metadata("design:type", String)
], Certificado.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], Certificado.prototype, "rutaArchivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Certificado.prototype, "passwordEncriptada", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Certificado.prototype, "fechaEmision", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Certificado.prototype, "fechaExpiracion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Certificado.prototype, "emisor", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Certificado.prototype, "sujeto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Certificado.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Certificado.prototype, "esProduccion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa),
    (0, typeorm_1.JoinColumn)({ name: 'empresaId' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], Certificado.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Certificado.prototype, "empresaId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Certificado.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Certificado.prototype, "updatedAt", void 0);
exports.Certificado = Certificado = __decorate([
    (0, typeorm_1.Entity)('certificados')
], Certificado);
//# sourceMappingURL=certificado.entity.js.map