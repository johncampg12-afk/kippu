import { Controller, Post, UploadedFile, UseInterceptors, Body, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CertificadoService } from './certificado.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('certificado')
export class CertificadoController {
  constructor(private readonly certificadoService: CertificadoService) {}

  @Post('upload/:empresaId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/\.(p12|pfx)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos .p12 o .pfx'), false);
        }
      },
    }),
  )
  async uploadCertificado(
    @UploadedFile() file: Express.Multer.File,
    @Body('password') password: string,
    @Body('esProduccion') esProduccion: string,
    @Param('empresaId') empresaId: string,
  ) {
    return this.certificadoService.uploadCertificado(
      file,
      password,
      empresaId,
      esProduccion === 'true',
    );
  }
}