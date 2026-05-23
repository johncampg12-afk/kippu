import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SriService } from './sri.service';
import { SriController } from './sri.controller';
import { FirmaElectronicaService } from './firma-electronica.service';
import { RideService } from './ride.service';
import { SriEnvioService } from './sri-envio.service';
import { SriRucService } from './sri-ruc.service';
import { Factura } from '../factura/entities/factura.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { Certificado } from '../certificado/entities/certificado.entity';
import { RucCache } from './entities/ruc-cache.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Factura, Empresa, Certificado, RucCache])],
  controllers: [SriController],
  providers: [
    SriService, 
    FirmaElectronicaService, 
    RideService, 
    SriEnvioService,
    SriRucService,
  ],
  exports: [
    TypeOrmModule,
    SriService, 
    FirmaElectronicaService, 
    RideService, 
    SriEnvioService,
    SriRucService,
  ],
})
export class SriModule {}