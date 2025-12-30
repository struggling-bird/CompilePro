import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TemplateVersion } from './template-version.entity';

export enum ConfigType {
  FILE = 'FILE',
  TEXT = 'TEXT',
}

@Entity('template_global_configs')
export class TemplateGlobalConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: ConfigType,
  })
  type: ConfigType;

  @Column({ type: 'text', nullable: true })
  defaultValue: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ default: false })
  isHidden: boolean;

  @ManyToOne(() => TemplateVersion, (version) => version.globalConfigs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'version_id' })
  version: TemplateVersion;

  @Column({ name: 'version_id' })
  versionId: string;
}
