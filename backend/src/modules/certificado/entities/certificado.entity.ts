import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity('certificados')
export class Certificado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 300 })
  nombre: string;

  @Column({ length: 500 })
  rutaArchivo: string; // Ruta donde se guarda el .p12/.pfx

  @Column({ length: 255 })
  passwordEncriptada: string; // Contraseña del certificado (encriptada)

  @Column({ type: 'date' })
  fechaEmision: Date;

  @Column({ type: 'date' })
  fechaExpiracion: Date;

  @Column({ length: 100, nullable: true })
  emisor: string; // Ej: "Security Data" o "Banco Central"

  @Column({ length: 100, nullable: true })
  sujeto: string; // CN = Nombre del titular

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'boolean', default: false })
  esProduccion: boolean; // true = Producción, false = Pruebas

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  @Column()
  empresaId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}