import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { DetalleFactura } from './entities/detalle-factura.entity';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { Empresa } from '../empresa/entities/empresa.entity';
import { Cliente } from '../cliente/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Factura, DetalleFactura, Empresa, Cliente])],
  controllers: [FacturaController],
  providers: [FacturaService],
  exports: [FacturaService],
})
export class FacturaModule {}