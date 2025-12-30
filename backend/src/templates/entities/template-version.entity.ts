import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Template } from './template.entity';
import { TemplateGlobalConfig } from './template-global-config.entity';
import { TemplateModule } from './template-module.entity';

export enum TemplateVersionStatus {
  ACTIVE = 'Active',
  DEPRECATED = 'Deprecated',
}

export enum TemplateVersionType {
  MAJOR = 'Major',
  MINOR = 'Minor',
  PATCH = 'Patch',
  HOTFIX = 'Hotfix',
  BRANCH = 'Branch',
}

@Entity('template_versions')
export class TemplateVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  version: string;

  @CreateDateColumn()
  createdAt: Date; // date in interface

  @Column({ default: false })
  isBranch: boolean;

  @Column({ length: 50, nullable: true })
  baseVersion: string;

  @Column({
    type: 'enum',
    enum: TemplateVersionStatus,
    default: TemplateVersionStatus.ACTIVE,
  })
  status: TemplateVersionStatus;

  @Column({ type: 'text', nullable: true })
  buildDoc: string;

  @Column({ type: 'text', nullable: true })
  updateDoc: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TemplateVersionType,
    nullable: true,
  })
  versionType: TemplateVersionType;

  @Column({ length: 100, nullable: true })
  creator: string;

  @ManyToOne(() => Template, (template) => template.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @Column({ name: 'template_id' })
  templateId: string;

  @ManyToOne(() => TemplateVersion, (version) => version.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: TemplateVersion;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @OneToMany(() => TemplateVersion, (version) => version.parent)
  children: TemplateVersion[];

  @OneToMany(() => TemplateGlobalConfig, (config) => config.version, {
    cascade: true,
  })
  globalConfigs: TemplateGlobalConfig[];

  @OneToMany(() => TemplateModule, (module) => module.version, {
    cascade: true,
  })
  modules: TemplateModule[];
}
