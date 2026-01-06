import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ConfigType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

@Entity('system_configs')
export class StorageConfig {
  @PrimaryColumn({ length: 100 })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  tip: string | null;

  @Column({
    type: 'enum',
    enum: ConfigType,
    default: ConfigType.STRING,
  })
  type: ConfigType;

  @Column({ length: 50, default: 'default' })
  group: string;

  @Column({ default: false })
  isSensitive: boolean;

  @Column({ default: false })
  isEncrypted: boolean;

  @Column({ type: 'json', nullable: true })
  options: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
