import { IsString, IsOptional, IsBoolean, Length, IsEmail } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @Length(13, 13)
  ruc: string;

  @IsString()
  razonSocial: string;

  @IsString()
  nombreComercial: string;

  @IsString()
  direccionMatriz: string;

  @IsString()
  @IsOptional()
  direccionEstablecimiento?: string;

  @IsString()
  codigoEstablecimiento: string;

  @IsString()
  codigoPuntoEmision: string;

  @IsBoolean()
  @IsOptional()
  obligadoContabilidad?: boolean;

  @IsString()
  @IsOptional()
  contribuyenteEspecial?: string;

  @IsString()
  @IsOptional()
  regimenMicroempresas?: string;

  @IsString()
  @IsOptional()
  agenteRetencion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}