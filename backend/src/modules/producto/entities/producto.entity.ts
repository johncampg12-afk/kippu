import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  codigo: string;

  @Column({ length: 300 })
  nombre: string;

  @Column({ length: 500, nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ length: 10, default: '2' })
  codigoIva: string; // '2'=15%, '0'=0%, '6'=No objeto IVA

  @Column({ length: 10, nullable: true })
  codigoIce: string; // Código ICE si aplica

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  porcentajeIce: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ManyToOne(() => Empresa, { nullable: true })
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  @Column({ nullable: true })
  empresaId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}