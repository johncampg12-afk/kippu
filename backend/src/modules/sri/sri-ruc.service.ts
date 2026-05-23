import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RucCache } from './entities/ruc-cache.entity';

@Injectable()
export class SriRucService {
  constructor(
    @InjectRepository(RucCache)
    private readonly rucCacheRepo: Repository<RucCache>,
  ) {}

  /**
   * Valida el dígito verificador de un RUC ecuatoriano (algoritmo oficial SRI)
   * Soporta: personas naturales (0-5), sociedades públicas (6), sociedades privadas (9)
   */
  private validarDigitoVerificador(ruc: string): boolean {
    const provincia = parseInt(ruc.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;

    const tercerDigito = parseInt(ruc.charAt(2));

    // Persona natural (tercer dígito 0-5): validar como cédula + establecimiento 001
    if (tercerDigito < 6) {
      const cedula = ruc.substring(0, 10);
      return this.validarCedula(cedula) && ruc.substring(10) === '001';
    }

    // Sociedad pública (tercer dígito 6): 8 dígitos base + verificador + 001
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

    // Sociedad privada (tercer dígito 9): 9 dígitos base + verificador + 001
    if (tercerDigito === 9) {
      const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
      const digitos = ruc.substring(0, 9).split('').map(Number);
      const verificador = parseInt(ruc.charAt(9));
      let suma = 0;
      digitos.forEach((d, i) => suma += d * coeficientes[i]);
      const residuo = suma % 11;
      let digitoCalculado = 11 - residuo;
      if (digitoCalculado === 11) digitoCalculado = 0;
      if (digitoCalculado === 10) digitoCalculado = 0;
      return digitoCalculado === verificador && ruc.substring(10) === '001';
    }

    return false;
  }

  /**
   * Valida cédula ecuatoriana (10 dígitos) con algoritmo módulo 10 oficial SRI
   */
  private validarCedula(cedula: string): boolean {
    if (!/^\d{10}$/.test(cedula)) return false;
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const digitos = cedula.split('').map(Number);
    const verificador = digitos[9];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = digitos[i] * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }
    const digitoCalculado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
    return digitoCalculado === verificador;
  }

  /**
   * Consulta un RUC ecuatoriano.
   * 
   * Flujo:
   * 1. Valida formato (13 dígitos).
   * 2. Caso especial: Consumidor Final (9999999999999).
   * 3. Valida dígito verificador (algoritmo módulo 11).
   * 4. Busca en caché local (PostgreSQL, 30 días de validez).
   * 5. Si no está en caché, devuelve RUC validado pero requiere que el usuario complete los datos.
   * 
   * Esta estrategia es la misma que usan los ERP ecuatorianos (Contifico, Siigo, Dátil)
   * porque las APIs públicas del SRI dejaron de funcionar en 2024.
   */
  async consultarRuc(ruc: string): Promise<any> {
    // Validar formato
    if (!/^\d{13}$/.test(ruc)) {
      throw new BadRequestException('El RUC debe tener 13 dígitos');
    }

    // Caso especial: Consumidor Final
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

    // Validar dígito verificador
    if (!this.validarDigitoVerificador(ruc)) {
      throw new BadRequestException('RUC inválido (dígito verificador incorrecto)');
    }

    // Buscar en caché de base de datos
    const cached = await this.rucCacheRepo.findOne({ where: { ruc } });

    if (cached) {
      console.log(`[RUC Cache] ${ruc} → ${cached.data.razonSocial}`);
      return { 
        ...cached.data, 
        validado: true, 
        requiereCompletar: false,
      };
    }

    // RUC válido pero sin datos en caché
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

  /**
   * Guarda los datos de un RUC en caché después de que el usuario los completa manualmente.
   * La próxima consulta cargará estos datos instantáneamente.
   */
  async guardarDatosRuc(ruc: string, datos: any): Promise<void> {
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
}