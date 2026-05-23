import { IsString, IsNumber, IsArray, IsDateString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DetalleFacturaDto {
  @IsString()
  productoId?: string;

  @IsString()
  codigoProducto: string;

  @IsString()
  nombreProducto: string;

  @IsNumber()
  cantidad: number;

  @IsNumber()
  precioUnitario: number;

  @IsNumber()
  @IsOptional()
  descuento?: number;

  @IsNumber()
  subtotal: number;

  @IsString()
  codigoIva: string;

  @IsNumber()
  valorIva: number;

  @IsString()
  @IsOptional()
  codigoIce?: string;

  @IsNumber()
  @IsOptional()
  valorIce?: number;
}

export class CreateFacturaDto {
  @IsString()
  empresaId: string;

  @IsString()
  clienteId: string;

  @IsDateString()
  fechaEmision: string;

  @IsString()
  razonSocialComprador: string;

  @IsString()
  identificacionComprador: string;

  @IsString()
  tipoIdentificacionComprador: string;

  @IsString()
  @IsOptional()
  direccionComprador?: string;

  @IsNumber()
  subtotal12: number;

  @IsNumber()
  subtotal0: number;

  @IsNumber()
  subtotalNoIva: number;

  @IsNumber()
  subtotal: number;

  @IsNumber()
  totalDescuento: number;

  @IsNumber()
  iva12: number;

  @IsNumber()
  @IsOptional()
  ice?: number;

  @IsNumber()
  total: number;

  @IsString()
  @IsOptional()
  ambiente?: string;

  @IsString()
  @IsOptional()
  tipoEmision?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleFacturaDto)
  detalles: DetalleFacturaDto[];
}