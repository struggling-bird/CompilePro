import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { ProjectVersion } from './version.entity';

export type ConfigType = 'TEXT' | 'FILE';

@Entity('version_configs')
@Unique(['version', 'name'])
export class VersionConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProjectVersion, (v) => v.configs, { onDelete: 'CASCADE' })
  version: ProjectVersion;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 16 })
  type: ConfigType;

  @Column({ type: 'text', nullable: true })
  textOrigin?: string | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  matchIndex?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileOriginPath?: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}
