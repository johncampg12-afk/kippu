"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SriModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sri_service_1 = require("./sri.service");
const sri_controller_1 = require("./sri.controller");
const firma_electronica_service_1 = require("./firma-electronica.service");
const ride_service_1 = require("./ride.service");
const sri_envio_service_1 = require("./sri-envio.service");
const sri_ruc_service_1 = require("./sri-ruc.service");
const factura_entity_1 = require("../factura/entities/factura.entity");
const empresa_entity_1 = require("../empresa/entities/empresa.entity");
const certificado_entity_1 = require("../certificado/entities/certificado.entity");
const ruc_cache_entity_1 = require("./entities/ruc-cache.entity");
let SriModule = class SriModule {
};
exports.SriModule = SriModule;
exports.SriModule = SriModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([factura_entity_1.Factura, empresa_entity_1.Empresa, certificado_entity_1.Certificado, ruc_cache_entity_1.RucCache])],
        controllers: [sri_controller_1.SriController],
        providers: [
            sri_service_1.SriService,
            firma_electronica_service_1.FirmaElectronicaService,
            ride_service_1.RideService,
            sri_envio_service_1.SriEnvioService,
            sri_ruc_service_1.SriRucService,
        ],
        exports: [
            typeorm_1.TypeOrmModule,
            sri_service_1.SriService,
            firma_electronica_service_1.FirmaElectronicaService,
            ride_service_1.RideService,
            sri_envio_service_1.SriEnvioService,
            sri_ruc_service_1.SriRucService,
        ],
    })
], SriModule);
//# sourceMappingURL=sri.module.js.map