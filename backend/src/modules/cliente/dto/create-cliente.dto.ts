import { IsString, IsOptional, Length } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @Length(10, 13)
  identificacion: string;

  @IsString()
  tipoIdentificacion: string;

  @IsString()
  razonSocial: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  empresaId?: string;
}