import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 13 })
  identificacion: string;

  @Column({ length: 20 })
  tipoIdentificacion: string;

  @Column({ length: 300 })
  razonSocial: string;

  @Column({ length: 300, nullable: true })
  direccion: string;

  @Column({ length: 100, nullable: true })
  telefono: string;

  @Column({ length: 100, nullable: true })
  email: string;

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