import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  precioUnitario: number;

  @IsString()
  codigoIva: string;

  @IsString()
  @IsOptional()
  codigoIce?: string;

  @IsNumber()
  @IsOptional()
  porcentajeIce?: number;

  @IsString()
  @IsOptional()
  empresaId?: string;
}