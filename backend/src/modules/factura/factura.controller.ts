import { Controller, Get, Post, Body, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Factura } from './entities/factura.entity';
import * as ExcelJS from 'exceljs';

@Controller('factura')
export class FacturaController {
  constructor(
    private readonly facturaService: FacturaService,
    @InjectRepository(Factura)
    private facturaRepo: Repository<Factura>,
  ) {}

  @Post()
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturaService.create(createFacturaDto);
  }

  @Get()
  async findAll(
    @Query('empresaId') empresaId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('cliente') cliente?: string,
    @Query('estado') estado?: string,
  ) {
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
    } else if (fechaInicio) {
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

  @Get('estadisticas/:empresaId')
  async getEstadisticas(@Param('empresaId') empresaId: string) {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
    const hoy = ahora.toISOString().split('T')[0];

    // Estadísticas del mes - SQL PURO (no memoria)
    const statsMes = await this.facturaRepo
      .createQueryBuilder('f')
      .select('COUNT(f.id)', 'facturasMes')
      .addSelect('COALESCE(SUM(f.total), 0)', 'totalMes')
      .where('f.empresaId = :empresaId', { empresaId })
      .andWhere('f.fechaEmision >= :inicio', { inicio: inicioMes })
      .andWhere('f.fechaEmision <= :fin', { fin: finMes })
      .getRawOne();

    // Por cobrar - SQL PURO
    const porCobrar = await this.facturaRepo
      .createQueryBuilder('f')
      .select('COALESCE(SUM(f.total), 0)', 'porCobrar')
      .where('f.empresaId = :empresaId', { empresaId })
      .andWhere('f.estado IN (:...estados)', { estados: ['PENDIENTE', 'ENVIADA', 'FIRMADA'] })
      .getRawOne();

    // Vencen hoy - SQL PURO
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

  @Get('exportar/:empresaId')
  async exportarExcel(
    @Param('empresaId') empresaId: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Res() res: Response,
  ) {
    const queryBuilder = this.facturaRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.cliente', 'c')
      .where('f.empresaId = :empresaId', { empresaId })
      .orderBy('f.fechaEmision', 'DESC')
      .addOrderBy('f.numeroComprobante', 'DESC')
      .take(5000); // 🔥 LÍMITE PARA NO EXPLOTAR RAM

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

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=facturas_${new Date().toISOString().split('T')[0]}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}