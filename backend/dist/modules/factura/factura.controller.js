"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacturaController = void 0;
const common_1 = require("@nestjs/common");
const factura_service_1 = require("./factura.service");
const create_factura_dto_1 = require("./dto/create-factura.dto");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const factura_entity_1 = require("./entities/factura.entity");
const ExcelJS = __importStar(require("exceljs"));
let FacturaController = class FacturaController {
    facturaService;
    facturaRepo;
    constructor(facturaService, facturaRepo) {
        this.facturaService = facturaService;
        this.facturaRepo = facturaRepo;
    }
    create(createFacturaDto) {
        return this.facturaService.create(createFacturaDto);
    }
    async findAll(empresaId, fechaInicio, fechaFin, cliente, estado) {
        const queryBuilder = this.facturaRepo
            .createQueryBuilder('f')
            .leftJoinAndSelect('f.cliente', 'c')
            .leftJoinAndSelect('f.detalles', 'd')
            .orderBy('f.fechaEmision', 'DESC')
            .addOrderBy('f.numeroComprobante', 'DESC');
        if (empresaId) {
            queryBuilder.andWhere('f.empresaId = :empresaId', { empresaId });
        }
        if (fechaInicio && fechaFin) {
            queryBuilder.andWhere('f.fechaEmision BETWEEN :inicio AND :fin', {
                inicio: fechaInicio,
                fin: fechaFin,
            });
        }
        else if (fechaInicio) {
            queryBuilder.andWhere('f.fechaEmision >= :inicio', { inicio: fechaInicio });
        }
        if (estado && estado !== 'TODOS') {
            queryBuilder.andWhere('f.estado = :estado', { estado });
        }
        if (cliente) {
            queryBuilder.andWhere('c.razonSocial ILIKE :cliente', { cliente: `%${cliente}%` });
        }
        return queryBuilder.getMany();
    }
    async getEstadisticas(empresaId) {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
        const hoy = ahora.toISOString().split('T')[0];
        const statsMes = await this.facturaRepo
            .createQueryBuilder('f')
            .select('COUNT(f.id)', 'facturasMes')
            .addSelect('COALESCE(SUM(f.total), 0)', 'totalMes')
            .where('f.empresaId = :empresaId', { empresaId })
            .andWhere('f.fechaEmision >= :inicio', { inicio: inicioMes })
            .andWhere('f.fechaEmision <= :fin', { fin: finMes })
            .getRawOne();
        const porCobrar = await this.facturaRepo
            .createQueryBuilder('f')
            .select('COALESCE(SUM(f.total), 0)', 'porCobrar')
            .where('f.empresaId = :empresaId', { empresaId })
            .andWhere('f.estado IN (:...estados)', { estados: ['PENDIENTE', 'ENVIADA', 'FIRMADA'] })
            .getRawOne();
        const vencenHoy = await this.facturaRepo
            .createQueryBuilder('f')
            .where('f.empresaId = :empresaId', { empresaId })
            .andWhere('f.estado NOT IN (:...estados)', { estados: ['AUTORIZADA', 'ANULADA'] })
            .andWhere(`DATE(f.fechaEmision) + INTERVAL '30 days' = DATE(:hoy)`, { hoy })
            .getCount();
        return {
            facturasMes: Number(statsMes?.facturasMes) || 0,
            totalMes: Number(statsMes?.totalMes) || 0,
            porCobrar: Number(porCobrar?.porCobrar) || 0,
            vencenHoy,
        };
    }
    async exportarExcel(empresaId, fechaInicio, fechaFin, res) {
        const queryBuilder = this.facturaRepo
            .createQueryBuilder('f')
            .leftJoinAndSelect('f.cliente', 'c')
            .where('f.empresaId = :empresaId', { empresaId })
            .orderBy('f.fechaEmision', 'DESC')
            .addOrderBy('f.numeroComprobante', 'DESC')
            .take(5000);
        if (fechaInicio && fechaFin) {
            queryBuilder.andWhere('f.fechaEmision BETWEEN :inicio AND :fin', {
                inicio: fechaInicio,
                fin: fechaFin,
            });
        }
        const facturas = await queryBuilder.getMany();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Facturas');
        worksheet.columns = [
            { header: 'Nº Comprobante', key: 'numero', width: 20 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Cliente', key: 'cliente', width: 40 },
            { header: 'RUC/CI', key: 'identificacion', width: 15 },
            { header: 'Subtotal 15%', key: 'subtotal15', width: 15 },
            { header: 'Subtotal 0%', key: 'subtotal0', width: 15 },
            { header: 'IVA 15%', key: 'iva', width: 15 },
            { header: 'Total', key: 'total', width: 15 },
            { header: 'Estado', key: 'estado', width: 15 },
        ];
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF3F4F6' },
        };
        facturas.forEach(f => {
            worksheet.addRow({
                numero: f.numeroComprobante,
                fecha: new Date(f.fechaEmision).toLocaleDateString('es-ES'),
                cliente: f.razonSocialComprador,
                identificacion: f.identificacionComprador,
                subtotal15: Number(f.subtotal12).toFixed(2),
                subtotal0: Number(f.subtotal0).toFixed(2),
                iva: Number(f.iva12).toFixed(2),
                total: Number(f.total).toFixed(2),
                estado: f.estado,
            });
        });
        worksheet.getColumn('subtotal15').numFmt = '"$"#,##0.00';
        worksheet.getColumn('subtotal0').numFmt = '"$"#,##0.00';
        worksheet.getColumn('iva').numFmt = '"$"#,##0.00';
        worksheet.getColumn('total').numFmt = '"$"#,##0.00';
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=facturas_${new Date().toISOString().split('T')[0]}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    }
};
exports.FacturaController = FacturaController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_factura_dto_1.CreateFacturaDto]),
    __metadata("design:returntype", void 0)
], FacturaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('empresaId')),
    __param(1, (0, common_1.Query)('fechaInicio')),
    __param(2, (0, common_1.Query)('fechaFin')),
    __param(3, (0, common_1.Query)('cliente')),
    __param(4, (0, common_1.Query)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FacturaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('estadisticas/:empresaId'),
    __param(0, (0, common_1.Param)('empresaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FacturaController.prototype, "getEstadisticas", null);
__decorate([
    (0, common_1.Get)('exportar/:empresaId'),
    __param(0, (0, common_1.Param)('empresaId')),
    __param(1, (0, common_1.Query)('fechaInicio')),
    __param(2, (0, common_1.Query)('fechaFin')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], FacturaController.prototype, "exportarExcel", null);
exports.FacturaController = FacturaController = __decorate([
    (0, common_1.Controller)('factura'),
    __param(1, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __metadata("design:paramtypes", [factura_service_1.FacturaService,
        typeorm_2.Repository])
], FacturaController);
//# sourceMappingURL=factura.controller.js.map