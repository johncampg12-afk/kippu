"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacturaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const factura_entity_1 = require("./entities/factura.entity");
const detalle_factura_entity_1 = require("./entities/detalle-factura.entity");
const factura_service_1 = require("./factura.service");
const factura_controller_1 = require("./factura.controller");
const empresa_entity_1 = require("../empresa/entities/empresa.entity");
const cliente_entity_1 = require("../cliente/entities/cliente.entity");
let FacturaModule = class FacturaModule {
};
exports.FacturaModule = FacturaModule;
exports.FacturaModule = FacturaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([factura_entity_1.Factura, detalle_factura_entity_1.DetalleFactura, empresa_entity_1.Empresa, cliente_entity_1.Cliente])],
        controllers: [factura_controller_1.FacturaController],
        providers: [factura_service_1.FacturaService],
        exports: [factura_service_1.FacturaService],
    })
], FacturaModule);
//# sourceMappingURL=factura.module.js.map