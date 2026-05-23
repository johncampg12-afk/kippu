import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('ruc_cache')
export class RucCache {
  @PrimaryColumn({ length: 13 })
  ruc: string;

  @Column({ type: 'jsonb' })
  data: any;

  @UpdateDateColumn()
  updatedAt: Date;
}