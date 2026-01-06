import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TemplateModuleConfig } from './template-module-config.entity';
import { TemplateVersion } from './template-version.entity';

export enum PublishMethod {
  GIT = 'GIT',
  DOWNLOAD = 'DOWNLOAD',
}

@Entity('template_modules')
export class TemplateModule {
  @ApiProperty({ description: '模块ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '元项目ID' })
  @Column({ length: 64 })
  projectId: string; // Reference to MetaProject

  @ApiProperty({ description: '项目名称' })
  @Column({ length: 100 })
  projectName: string;

  @ApiProperty({ description: '项目版本' })
  @Column({ length: 50 })
  projectVersion: string;

  @ApiProperty({
    enum: PublishMethod,
    description: '发布方式',
    default: PublishMethod.GIT,
  })
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

  @ApiProperty({ description: '所属版本ID' })
  @Column({ name: 'version_id' })
  versionId: string;

  @ApiProperty({
    type: () => [TemplateModuleConfig],
    description: '模块配置列表',
  })
  @OneToMany(() => TemplateModuleConfig, (config) => config.module, {
    cascade: true,
  })
  configs: TemplateModuleConfig[];
}
