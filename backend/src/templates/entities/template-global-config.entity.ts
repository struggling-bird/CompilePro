import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TemplateVersion } from './template-version.entity';

export enum ConfigType {
  FILE = 'FILE',
  TEXT = 'TEXT',
}

@Entity('template_global_configs')
export class TemplateGlobalConfig {
  @ApiProperty({ description: '配置ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '配置名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ enum: ConfigType, description: '配置类型' })
  @Column({
    type: 'enum',
    enum: ConfigType,
  })
  type: ConfigType;

  @ApiProperty({ description: '默认值', required: false })
  @Column({ type: 'text', nullable: true })
  defaultValue: string;

  @ApiProperty({ description: '描述', required: false })
  @Column({ length: 500, nullable: true })
  description: string;

  @ApiProperty({ description: '是否隐藏', default: false })
  @Column({ default: false })
  isHidden: boolean;

  @ManyToOne(() => TemplateVersion, (version) => version.globalConfigs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'version_id' })
  version: TemplateVersion;

  @ApiProperty({ description: '所属版本ID' })
  @Column({ name: 'version_id' })
  versionId: string;
}
