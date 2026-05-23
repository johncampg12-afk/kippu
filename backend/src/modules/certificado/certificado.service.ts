import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificado } from './entities/certificado.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as forge from 'node-forge';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CertificadoService {
  constructor(
    @InjectRepository(Certificado)
    private certificadoRepo: Repository<Certificado>,
  ) {}

  async uploadCertificado(
    file: Express.Multer.File,
    password: string,
    empresaId: string,
    esProduccion: boolean = false,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo de certificado requerido');
    }

    // Validar que sea .p12 o .pfx
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.p12' && ext !== '.pfx') {
      throw new BadRequestException('El archivo debe ser .p12 o .pfx');
    }

    // Leer y validar el certificado con la contraseña
    try {
      const p12Buffer = fs.readFileSync(file.path);
      const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
      
      // Extraer información del certificado
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      if (!certBags[forge.pki.oids.certBag] || certBags[forge.pki.oids.certBag].length === 0) {
        throw new Error('No se encontró certificado en el archivo');
      }

      const cert = certBags[forge.pki.oids.certBag][0].cert;
      const sujeto = cert.subject.getField('CN')?.value || '';
      const emisor = cert.issuer.getField('CN')?.value || '';
      const fechaEmision = cert.validity.notBefore;
      const fechaExpiracion = cert.validity.notAfter;

      // Verificar que no esté expirado
      const ahora = new Date();
      if (new Date(fechaExpiracion) < ahora) {
        throw new Error('El certificado está expirado');
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Mover archivo a ubicación segura
      const uploadDir = path.join(process.cwd(), 'uploads', 'certificados', empresaId);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${file.originalname}`;
      const newPath = path.join(uploadDir, fileName);
      fs.renameSync(file.path, newPath);

      // Guardar en BD
      const certificado = this.certificadoRepo.create({
        nombre: file.originalname,
        rutaArchivo: newPath,
        passwordEncriptada: hashedPassword,
        fechaEmision: new Date(fechaEmision),
        fechaExpiracion: new Date(fechaExpiracion),
        emisor,
        sujeto,
        empresaId,
        esProduccion,
        activo: true,
      });

      await this.certificadoRepo.save(certificado);

      return {
        message: 'Certificado subido exitosamente',
        certificado: {
          id: certificado.id,
          sujeto: certificado.sujeto,
          emisor: certificado.emisor,
          fechaExpiracion: certificado.fechaExpiracion,
        },
      };
    } catch (error) {
      // Limpiar archivo temporal si hay error
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new BadRequestException(
        `Error al procesar certificado: ${error.message}`,
      );
    }
  }
}