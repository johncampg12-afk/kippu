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
exports.FacturaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const factura_entity_1 = require("./entities/factura.entity");
const detalle_factura_entity_1 = require("./entities/detalle-factura.entity");
const empresa_entity_1 = require("../empresa/entities/empresa.entity");
const cliente_entity_1 = require("../cliente/entities/cliente.entity");
let FacturaService = class FacturaService {
    facturaRepo;
    detalleRepo;
    empresaRepo;
    clienteRepo;
    constructor(facturaRepo, detalleRepo, empresaRepo, clienteRepo) {
        this.facturaRepo = facturaRepo;
        this.detalleRepo = detalleRepo;
        this.empresaRepo = empresaRepo;
        this.clienteRepo = clienteRepo;
    }
    async create(createFacturaDto) {
        const empresa = await this.empresaRepo.findOne({
            where: { id: createFacturaDto.empresaId },
        });
        if (!empresa) {
            throw new common_1.NotFoundException('Empresa no encontrada');
        }
        const cliente = await this.clienteRepo.findOne({
            where: { id: createFacturaDto.clienteId },
        });
        if (!cliente) {
            throw new common_1.NotFoundException('Cliente no encontrado');
        }
        const ultimaFactura = await this.facturaRepo.findOne({
            where: { empresaId: empresa.id },
            order: { createdAt: 'DESC' },
        });
        let secuencial = 1;
        if (ultimaFactura) {
            const partes = ultimaFactura.numeroComprobante.split('-');
            secuencial = parseInt(partes[2]) + 1;
        }
        const numeroComprobante = `${empresa.codigoEstablecimiento}-${empresa.codigoPuntoEmision}-${String(secuencial).padStart(9, '0')}`;
        const fechaEmision = new Date(createFacturaDto.fechaEmision);
        const fechaStr = fechaEmision.toISOString().split('T')[0].replace(/-/g, '').substring(2);
        const tipoComprobante = factura_entity_1.TipoDocumento.FACTURA;
        const ruc = empresa.ruc;
        const ambiente = createFacturaDto.ambiente || '01';
        const serie = `${empresa.codigoEstablecimiento}${empresa.codigoPuntoEmision}`;
        const numero = String(secuencial).padStart(9, '0');
        const codigoNumerico = '12345678';
        const tipoEmision = createFacturaDto.tipoEmision || '1';
        const claveSinDigito = `${fechaStr}${tipoComprobante}${ruc}${ambiente}${serie}${numero}${codigoNumerico}${tipoEmision}`;
        const digitoVerificador = this.calcularDigitoVerificador(claveSinDigito);
        const claveAcceso = claveSinDigito + digitoVerificador;
        const factura = this.facturaRepo.create({
            ...createFacturaDto,
            numeroComprobante,
            claveAcceso,
            tipoDocumento: factura_entity_1.TipoDocumento.FACTURA,
            estado: factura_entity_1.EstadoFactura.PENDIENTE,
            empresaId: empresa.id,
            clienteId: cliente.id,
        });
        const facturaGuardada = await this.facturaRepo.save(factura);
        for (const detalleDto of createFacturaDto.detalles) {
            const detalle = this.detalleRepo.create({
                ...detalleDto,
                facturaId: facturaGuardada.id,
            });
            await this.detalleRepo.save(detalle);
        }
        return facturaGuardada;
    }
    calcularDigitoVerificador(claveSinDigito) {
        const coeficientes = [2, 3, 4, 5, 6, 7];
        let suma = 0;
        for (let i = 0; i < claveSinDigito.length; i++) {
            const digito = parseInt(claveSinDigito.charAt(claveSinDigito.length - 1 - i));
            const coeficiente = coeficientes[i % 6];
            suma += digito * coeficiente;
        }
        const residuo = suma % 11;
        const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;
        return digitoVerificador === 10 ? '1' : digitoVerificador === 11 ? '0' : digitoVerificador.toString();
    }
    async findAll() {
        return this.facturaRepo.find({
            relations: ['cliente', 'detalles'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.FacturaService = FacturaService;
exports.FacturaService = FacturaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __param(1, (0, typeorm_1.InjectRepository)(detalle_factura_entity_1.DetalleFactura)),
    __param(2, (0, typeorm_1.InjectRepository)(empresa_entity_1.Empresa)),
    __param(3, (0, typeorm_1.InjectRepository)(cliente_entity_1.Cliente)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FacturaService);
//# sourceMappingURL=factura.service.js.map