import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura, EstadoFactura, TipoDocumento } from './entities/factura.entity';
import { DetalleFactura } from './entities/detalle-factura.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Empresa } from '../empresa/entities/empresa.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import * as crypto from 'crypto';

@Injectable()
export class FacturaService {
  constructor(
    @InjectRepository(Factura)
    private facturaRepo: Repository<Factura>,
    @InjectRepository(DetalleFactura)
    private detalleRepo: Repository<DetalleFactura>,
    @InjectRepository(Empresa)
    private empresaRepo: Repository<Empresa>,
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) {}

  async create(createFacturaDto: CreateFacturaDto) {
    const empresa = await this.empresaRepo.findOne({
      where: { id: createFacturaDto.empresaId },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const cliente = await this.clienteRepo.findOne({
      where: { id: createFacturaDto.clienteId },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Generar secuencial (simplificado - debe ser por base de datos)
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
    
    // Generar clave de acceso (49 dígitos)
    const fechaEmision = new Date(createFacturaDto.fechaEmision);
    const fechaStr = fechaEmision.toISOString().split('T')[0].replace(/-/g, '').substring(2);
    const tipoComprobante = TipoDocumento.FACTURA;
    const ruc = empresa.ruc;
    const ambiente = createFacturaDto.ambiente || '01';
    const serie = `${empresa.codigoEstablecimiento}${empresa.codigoPuntoEmision}`;
    const numero = String(secuencial).padStart(9, '0');
    const codigoNumerico = '12345678'; // Código aleatorio
    const tipoEmision = createFacturaDto.tipoEmision || '1';
    
    const claveSinDigito = `${fechaStr}${tipoComprobante}${ruc}${ambiente}${serie}${numero}${codigoNumerico}${tipoEmision}`;
    const digitoVerificador = this.calcularDigitoVerificador(claveSinDigito);
    const claveAcceso = claveSinDigito + digitoVerificador;

    // Crear factura
    const factura = this.facturaRepo.create({
      ...createFacturaDto,
      numeroComprobante,
      claveAcceso,
      tipoDocumento: TipoDocumento.FACTURA,
      estado: EstadoFactura.PENDIENTE,
      empresaId: empresa.id,
      clienteId: cliente.id,
    });

    const facturaGuardada = await this.facturaRepo.save(factura);

    // Guardar detalles
    for (const detalleDto of createFacturaDto.detalles) {
      const detalle = this.detalleRepo.create({
        ...detalleDto,
        facturaId: facturaGuardada.id,
      });
      await this.detalleRepo.save(detalle);
    }

    return facturaGuardada;
  }

  private calcularDigitoVerificador(claveSinDigito: string): string {
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
}