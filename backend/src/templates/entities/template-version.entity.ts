import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ description: '版本ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '版本号' })
  @Column({ length: 50 })
  version: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date; // date in interface

  @ApiProperty({ description: '是否为分支版本' })
  @Column({ default: false })
  isBranch: boolean;

  @ApiProperty({ description: '基础版本号', required: false })
  @Column({ length: 50, nullable: true })
  baseVersion: string;

  @ApiProperty({ enum: TemplateVersionStatus, description: '状态' })
  @Column({
    type: 'enum',
    enum: TemplateVersionStatus,
    default: TemplateVersionStatus.ACTIVE,
  })
  status: TemplateVersionStatus;

  @ApiProperty({ description: '构建文档', required: false })
  @Column({ type: 'text', nullable: true })
  buildDoc: string;

  @ApiProperty({ description: '更新文档', required: false })
  @Column({ type: 'text', nullable: true })
  updateDoc: string;

  @ApiProperty({ description: '描述', required: false })
  @Column({ length: 500, nullable: true })
  description: string;

  @ApiProperty({
    enum: TemplateVersionType,
    description: '版本类型',
    required: false,
  })
  @Column({
    type: 'enum',
    enum: TemplateVersionType,
    nullable: true,
  })
  versionType: TemplateVersionType;

  @ApiProperty({ description: '创建者', required: false })
  @Column({ length: 100, nullable: true })
  creator: string;

  @ManyToOne(() => Template, (template) => template.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @ApiProperty({ description: '所属模版ID' })
  @Column({ name: 'template_id' })
  templateId: string;

  @ManyToOne(() => TemplateVersion, (version) => version.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: TemplateVersion;

  @ApiProperty({ description: '父版本ID', required: false })
  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @ApiProperty({ type: () => [TemplateVersion], description: '子版本列表' })
  @OneToMany(() => TemplateVersion, (version) => version.parent)
  children: TemplateVersion[];

  @ApiProperty({
    type: () => [TemplateGlobalConfig],
    description: '全局配置列表',
  })
  @OneToMany(() => TemplateGlobalConfig, (config) => config.version, {
    cascade: true,
  })
  globalConfigs: TemplateGlobalConfig[];

  @ApiProperty({ type: () => [TemplateModule], description: '模块列表' })
  @OneToMany(() => TemplateModule, (module) => module.version, {
    cascade: true,
  })
  modules: TemplateModule[];
}
