import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TemplateModuleConfig } from './template-module-config.entity';
import { TemplateVersion } from './template-version.entity';

export enum PublishMethod {
  GIT = 'GIT',
  DOWNLOAD = 'DOWNLOAD',
}

@Entity('template_modules')
export class TemplateModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  projectId: string; // Reference to MetaProject

  @Column({ length: 100 })
  projectName: string;

  @Column({ length: 50 })
  projectVersion: string;

  @Column({
    type: 'enum',
    enum: PublishMethod,
    default: PublishMethod.GIT,
  })
  publishMethod: PublishMethod;

  @ManyToOne(() => TemplateVersion, (version) => version.modules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'version_id' })
  version: TemplateVersion;

  @Column({ name: 'version_id' })
  versionId: string;

  @OneToMany(() => TemplateModuleConfig, (config) => config.module, {
    cascade: true,
  })
  configs: TemplateModuleConfig[];
}
