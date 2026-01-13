import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Compilation } from './compilation.entity';
import { TemplateModule } from '../../templates/entities/template-module.entity';
import { MappingType } from '../../templates/entities/template-module-config.entity';

@Entity('compilation_module_configs')
export class CompilationModuleConfig {
  @ApiProperty({ description: '编译模块配置ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '所属编译任务ID' })
  @Column({ name: 'compilation_id' })
  compilationId: string;

  @ManyToOne(() => Compilation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'compilation_id' })
  compilation: Compilation;

  @ApiProperty({ description: '所属模板模块ID' })
  @Column({ name: 'module_id' })
  moduleId: string;

  @ManyToOne(() => TemplateModule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: TemplateModule;

  @ApiProperty({ description: '配置名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '文件位置' })
  @Column({ length: 255 })
  fileLocation: string;

  @ApiProperty({ enum: MappingType, description: '映射类型' })
  @Column({ type: 'enum', enum: MappingType })
  mappingType: MappingType;

  @ApiProperty({ description: '映射值', required: false })
  @Column({ type: 'text', nullable: true })
  mappingValue: string;

  @ApiProperty({ description: '正则匹配', required: false })
  @Column({ length: 255, nullable: true })
  regex: string;

  @ApiProperty({ description: '描述', required: false })
  @Column({ length: 500, nullable: true })
  description: string;

  @ApiProperty({ description: '是否隐藏', default: false })
  @Column({ default: false })
  isHidden: boolean;

  @ApiProperty({ description: '是否选中', default: true })
  @Column({ default: true })
  isSelected: boolean;

  @ApiProperty({ description: '当前值', required: false })
  @Column({ type: 'text', nullable: true })
  value: string;

  @ApiProperty({ description: '来源模板配置ID', required: false })
  @Column({ name: 'template_config_id', nullable: true })
  templateConfigId: string;
}
