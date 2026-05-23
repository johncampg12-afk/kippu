import { IsString, IsEmail, MinLength, Length } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  // Datos de la empresa
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
  codigoEstablecimiento: string;

  @IsString()
  codigoPuntoEmision: string;
}