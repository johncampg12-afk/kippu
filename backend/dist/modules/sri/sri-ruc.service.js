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
exports.SriRucService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ruc_cache_entity_1 = require("./entities/ruc-cache.entity");
let SriRucService = class SriRucService {
    rucCacheRepo;
    constructor(rucCacheRepo) {
        this.rucCacheRepo = rucCacheRepo;
    }
    validarDigitoVerificador(ruc) {
        const provincia = parseInt(ruc.substring(0, 2));
        if (provincia < 1 || provincia > 24)
            return false;
        const tercerDigito = parseInt(ruc.charAt(2));
        if (tercerDigito < 6) {
            const cedula = ruc.substring(0, 10);
            return this.validarCedula(cedula) && ruc.substring(10) === '001';
        }
        if (tercerDigito === 6) {
            const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
            const digitos = ruc.substring(0, 8).split('').map(Number);
            const verificador = parseInt(ruc.charAt(8));
            let suma = 0;
            digitos.forEach((d, i) => suma += d * coeficientes[i]);
            const residuo = suma % 11;
            const digitoCalculado = residuo === 0 ? 0 : 11 - residuo;
            return digitoCalculado === verificador && ruc.substring(9) === '001';
        }
        if (tercerDigito === 9) {
            const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
            const digitos = ruc.substring(0, 9).split('').map(Number);
            const verificador = parseInt(ruc.charAt(9));
            let suma = 0;
            digitos.forEach((d, i) => suma += d * coeficientes[i]);
            const residuo = suma % 11;
            let digitoCalculado = 11 - residuo;
            if (digitoCalculado === 11)
                digitoCalculado = 0;
            if (digitoCalculado === 10)
                digitoCalculado = 0;
            return digitoCalculado === verificador && ruc.substring(10) === '001';
        }
        return false;
    }
    validarCedula(cedula) {
        if (!/^\d{10}$/.test(cedula))
            return false;
        const provincia = parseInt(cedula.substring(0, 2));
        if (provincia < 1 || provincia > 24)
            return false;
        const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        const digitos = cedula.split('').map(Number);
        const verificador = digitos[9];
        let suma = 0;
        for (let i = 0; i < 9; i++) {
            let valor = digitos[i] * coeficientes[i];
            if (valor >= 10)
                valor -= 9;
            suma += valor;
        }
        const digitoCalculado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
        return digitoCalculado === verificador;
    }
    async consultarRuc(ruc) {
        if (!/^\d{13}$/.test(ruc)) {
            throw new common_1.BadRequestException('El RUC debe tener 13 dígitos');
        }
        if (ruc === '9999999999999') {
            return {
                ruc,
                razonSocial: 'CONSUMIDOR FINAL',
                nombreComercial: 'CONSUMIDOR FINAL',
                estado: 'ACTIVO',
                obligadoContabilidad: false,
                tipoContribuyente: 'PERSONA NATURAL',
                direccion: 'N/A',
                validado: true,
                requiereCompletar: false,
            };
        }
        if (!this.validarDigitoVerificador(ruc)) {
            throw new common_1.BadRequestException('RUC inválido (dígito verificador incorrecto)');
        }
        const cached = await this.rucCacheRepo.findOne({ where: { ruc } });
        if (cached) {
            console.log(`[RUC Cache] ${ruc} → ${cached.data.razonSocial}`);
            return {
                ...cached.data,
                validado: true,
                requiereCompletar: false,
            };
        }
        const tercerDigito = parseInt(ruc.charAt(2));
        return {
            ruc,
            razonSocial: '',
            nombreComercial: '',
            estado: '',
            obligadoContabilidad: false,
            tipoContribuyente: tercerDigito < 6 ? 'PERSONA NATURAL' : 'SOCIEDAD',
            direccion: '',
            validado: true,
            requiereCompletar: true,
        };
    }
    async guardarDatosRuc(ruc, datos) {
        await this.rucCacheRepo.save({
            ruc,
            data: {
                ruc,
                razonSocial: datos.razonSocial || '',
                nombreComercial: datos.nombreComercial || '',
                estado: datos.estado || 'ACTIVO',
                obligadoContabilidad: datos.obligadoContabilidad || false,
                tipoContribuyente: datos.tipoContribuyente || 'DESCONOCIDO',
                direccion: datos.direccion || '',
            },
        });
    }
};
exports.SriRucService = SriRucService;
exports.SriRucService = SriRucService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ruc_cache_entity_1.RucCache)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SriRucService);
//# sourceMappingURL=sri-ruc.service.js.map