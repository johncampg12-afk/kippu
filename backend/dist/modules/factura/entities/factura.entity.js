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
exports.Factura = exports.TipoDocumento = exports.EstadoFactura = void 0;
const typeorm_1 = require("typeorm");
const empresa_entity_1 = require("../../empresa/entities/empresa.entity");
const cliente_entity_1 = require("../../cliente/entities/cliente.entity");
const detalle_factura_entity_1 = require("./detalle-factura.entity");
var EstadoFactura;
(function (EstadoFactura) {
    EstadoFactura["PENDIENTE"] = "PENDIENTE";
    EstadoFactura["FIRMADA"] = "FIRMADA";
    EstadoFactura["ENVIADA"] = "ENVIADA";
    EstadoFactura["AUTORIZADA"] = "AUTORIZADA";
    EstadoFactura["RECHAZADA"] = "RECHAZADA";
    EstadoFactura["ANULADA"] = "ANULADA";
})(EstadoFactura || (exports.EstadoFactura = EstadoFactura = {}));
var TipoDocumento;
(function (TipoDocumento) {
    TipoDocumento["FACTURA"] = "01";
    TipoDocumento["NOTA_CREDITO"] = "04";
    TipoDocumento["NOTA_DEBITO"] = "05";
    TipoDocumento["GUIA_REMISION"] = "06";
    TipoDocumento["RETENCION"] = "07";
})(TipoDocumento || (exports.TipoDocumento = TipoDocumento = {}));
let Factura = class Factura {
    id;
    claveAcceso;
    numeroComprobante;
    fechaEmision;
    tipoDocumento;
    ambiente;
    tipoEmision;
    razonSocialComprador;
    identificacionComprador;
    tipoIdentificacionComprador;
    direccionComprador;
    subtotal12;
    subtotal0;
    subtotalNoIva;
    subtotal;
    totalDescuento;
    iva12;
    ice;
    total;
    moneda;
    numeroAutorizacion;
    fechaAutorizacion;
    xmlPath;
    pdfPath;
    mensajeError;
    estado;
    empresa;
    empresaId;
    cliente;
    clienteId;
    detalles;
    createdAt;
    updatedAt;
};
exports.Factura = Factura;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Factura.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 49, unique: true }),
    __metadata("design:type", String)
], Factura.prototype, "claveAcceso", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 17 }),
    __metadata("design:type", String)
], Factura.prototype, "numeroComprobante", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Factura.prototype, "fechaEmision", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TipoDocumento,
        default: TipoDocumento.FACTURA,
    }),
    __metadata("design:type", String)
], Factura.prototype, "tipoDocumento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2, default: '01' }),
    __metadata("design:type", String)
], Factura.prototype, "ambiente", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2, default: '1' }),
    __metadata("design:type", String)
], Factura.prototype, "tipoEmision", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300 }),
    __metadata("design:type", String)
], Factura.prototype, "razonSocialComprador", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 13 }),
    __metadata("design:type", String)
], Factura.prototype, "identificacionComprador", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Factura.prototype, "tipoIdentificacionComprador", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "direccionComprador", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Factura.prototype, "subtotal12", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Factura.prototype, "subtotal0", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Factura.prototype, "subtotalNoIva", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Factura.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Factura.prototype, "totalDescuento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Factura.prototype, "iva12", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Factura.prototype, "ice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Factura.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "moneda", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "numeroAutorizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Factura.prototype, "fechaAutorizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "xmlPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "pdfPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "mensajeError", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EstadoFactura,
        default: EstadoFactura.PENDIENTE,
    }),
    __metadata("design:type", String)
], Factura.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa),
    (0, typeorm_1.JoinColumn)({ name: 'empresaId' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], Factura.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Factura.prototype, "empresaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente),
    (0, typeorm_1.JoinColumn)({ name: 'clienteId' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], Factura.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Factura.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => detalle_factura_entity_1.DetalleFactura, (detalle) => detalle.factura, { cascade: true }),
    __metadata("design:type", Array)
], Factura.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Factura.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Factura.prototype, "updatedAt", void 0);
exports.Factura = Factura = __decorate([
    (0, typeorm_1.Entity)('facturas')
], Factura);
//# sourceMappingURL=factura.entity.js.map