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
exports.CreateFacturaDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class DetalleFacturaDto {
    productoId;
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
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DetalleFacturaDto.prototype, "productoId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DetalleFacturaDto.prototype, "codigoProducto", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DetalleFacturaDto.prototype, "nombreProducto", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DetalleFacturaDto.prototype, "cantidad", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DetalleFacturaDto.prototype, "precioUnitario", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], DetalleFacturaDto.prototype, "descuento", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DetalleFacturaDto.prototype, "subtotal", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DetalleFacturaDto.prototype, "codigoIva", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DetalleFacturaDto.prototype, "valorIva", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DetalleFacturaDto.prototype, "codigoIce", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], DetalleFacturaDto.prototype, "valorIce", void 0);
class CreateFacturaDto {
    empresaId;
    clienteId;
    fechaEmision;
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
    ambiente;
    tipoEmision;
    detalles;
}
exports.CreateFacturaDto = CreateFacturaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFacturaDto.prototype, "empresaId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFacturaDto.prototype, "clienteId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateFacturaDto.prototype, "fechaEmision", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFacturaDto.prototype, "razonSocialComprador", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFacturaDto.prototype, "identificacionComprador", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFacturaDto.prototype, "tipoIdentificacionComprador", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFacturaDto.prototype, "direccionComprador", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFacturaDto.prototype, "subtotal12", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFacturaDto.prototype, "subtotal0", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFacturaDto.prototype, "subtotalNoIva", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFacturaDto.prototype, "subtotal", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFacturaDto.prototype, "totalDescuento", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFacturaDto.prototype, "iva12", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateFacturaDto.prototype, "ice", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFacturaDto.prototype, "total", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFacturaDto.prototype, "ambiente", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFacturaDto.prototype, "tipoEmision", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DetalleFacturaDto),
    __metadata("design:type", Array)
], CreateFacturaDto.prototype, "detalles", void 0);
//# sourceMappingURL=create-factura.dto.js.map