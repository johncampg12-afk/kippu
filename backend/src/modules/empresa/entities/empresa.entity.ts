import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 13 })
  ruc: string;

  @Column({ length: 300 })
  razonSocial: string;

  @Column({ length: 300 })
  nombreComercial: string;

  @Column({ length: 300 })
  direccionMatriz: string;

  @Column({ length: 300, nullable: true })
  direccionEstablecimiento: string;

  @Column({ length: 50 })
  codigoEstablecimiento: string; // Ej: "001"

  @Column({ length: 50 })
  codigoPuntoEmision: string; // Ej: "001"

  @Column({ type: 'boolean', default: true })
  obligadoContabilidad: boolean;

  @Column({ length: 20, nullable: true })
  contribuyenteEspecial: string;

  @Column({ length: 20, nullable: true })
  regimenMicroempresas: string;

  @Column({ length: 20, nullable: true })
  agenteRetencion: string;

  @Column({ length: 100, nullable: true })
  telefono: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  logoUrl: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}