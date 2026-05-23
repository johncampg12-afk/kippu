import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { DetalleFactura } from './detalle-factura.entity';

export enum EstadoFactura {
  PENDIENTE = 'PENDIENTE',
  FIRMADA = 'FIRMADA',
  ENVIADA = 'ENVIADA',
  AUTORIZADA = 'AUTORIZADA',
  RECHAZADA = 'RECHAZADA',
  ANULADA = 'ANULADA',
}

export enum TipoDocumento {
  FACTURA = '01',
  NOTA_CREDITO = '04',
  NOTA_DEBITO = '05',
  GUIA_REMISION = '06',
  RETENCION = '07',
}

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 49, unique: true })
  claveAcceso: string;

  @Column({ length: 17 })
  numeroComprobante: string; // Ej: 001-001-000000123

  @Column({ type: 'date' })
  fechaEmision: Date;

  @Column({
    type: 'enum',
    enum: TipoDocumento,
    default: TipoDocumento.FACTURA,
  })
  tipoDocumento: TipoDocumento;

  @Column({ length: 2, default: '01' })
  ambiente: string; // '01' = Pruebas, '02' = Producción

  @Column({ length: 2, default: '1' })
  tipoEmision: string; // '1' = Normal

  @Column({ length: 300 })
  razonSocialComprador: string;

  @Column({ length: 13 })
  identificacionComprador: string;

  @Column({ length: 20 })
  tipoIdentificacionComprador: string;

  @Column({ length: 300, nullable: true })
  direccionComprador: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal12: number; // Base imponible 15%

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal0: number; // Base imponible 0%

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotalNoIva: number; // No objeto de IVA

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalDescuento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  iva12: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  ice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ length: 200, nullable: true })
  moneda: string;

  @Column({ length: 10, nullable: true })
  numeroAutorizacion: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaAutorizacion: Date;

  @Column({ length: 500, nullable: true })
  xmlPath: string;

  @Column({ length: 500, nullable: true })
  pdfPath: string;

  @Column({ type: 'text', nullable: true })
  mensajeError: string;

  @Column({
    type: 'enum',
    enum: EstadoFactura,
    default: EstadoFactura.PENDIENTE,
  })
  estado: EstadoFactura;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  @Column()
  empresaId: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column()
  clienteId: string;

  @OneToMany(() => DetalleFactura, (detalle) => detalle.factura, { cascade: true })
  detalles: DetalleFactura[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}