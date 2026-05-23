import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Factura } from './factura.entity';
import { Producto } from '../../producto/entities/producto.entity';

@Entity('detalles_factura')
export class DetalleFactura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  codigoProducto: string;

  @Column({ length: 300 })
  nombreProducto: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ length: 10 })
  codigoIva: string; // '2'=15%, '0'=0%, '6'=No objeto IVA

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorIva: number;

  @Column({ length: 10, nullable: true })
  codigoIce: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorIce: number;

  @ManyToOne(() => Factura)
  @JoinColumn({ name: 'facturaId' })
  factura: Factura;

  @Column()
  facturaId: string;

  @ManyToOne(() => Producto, { nullable: true })
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @Column({ nullable: true })
  productoId: string;
}