import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificado } from './entities/certificado.entity';
import { CertificadoService } from './certificado.service';
import { CertificadoController } from './certificado.controller';
import { EmpresaModule } from '../empresa/empresa.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificado]),
    EmpresaModule,
  ],
  controllers: [CertificadoController],
  providers: [CertificadoService],
  exports: [CertificadoService],
})
export class CertificadoModule {}