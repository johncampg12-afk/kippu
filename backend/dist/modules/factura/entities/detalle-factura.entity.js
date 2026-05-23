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
exports.DetalleFactura = void 0;
const typeorm_1 = require("typeorm");
const factura_entity_1 = require("./factura.entity");
const producto_entity_1 = require("../../producto/entities/producto.entity");
let DetalleFactura = class DetalleFactura {
    id;
    codigoProducto;
    nombreProducto;
    cantidad;
    precioUnitario;
    descuento;
    subtotal;
    codigoIva;
    valorIva;
    codigoIce;
    valorIce;
    factura;
    facturaId;
    producto;
    productoId;
};
exports.DetalleFactura = DetalleFactura;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DetalleFactura.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], DetalleFactura.prototype, "codigoProducto", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300 }),
    __metadata("design:type", String)
], DetalleFactura.prototype, "nombreProducto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DetalleFactura.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DetalleFactura.prototype, "precioUnitario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DetalleFactura.prototype, "descuento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DetalleFactura.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], DetalleFactura.prototype, "codigoIva", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DetalleFactura.prototype, "valorIva", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", String)
], DetalleFactura.prototype, "codigoIce", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DetalleFactura.prototype, "valorIce", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => factura_entity_1.Factura),
    (0, typeorm_1.JoinColumn)({ name: 'facturaId' }),
    __metadata("design:type", factura_entity_1.Factura)
], DetalleFactura.prototype, "factura", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DetalleFactura.prototype, "facturaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => producto_entity_1.Producto, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'productoId' }),
    __metadata("design:type", producto_entity_1.Producto)
], DetalleFactura.prototype, "producto", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DetalleFactura.prototype, "productoId", void 0);
exports.DetalleFactura = DetalleFactura = __decorate([
    (0, typeorm_1.Entity)('detalles_factura')
], DetalleFactura);
//# sourceMappingURL=detalle-factura.entity.js.map