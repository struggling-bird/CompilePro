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
import { TemplateModuleConfig } from '../../templates/entities/template-module-config.entity';

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

  @ApiProperty({ description: '当前值', required: false })
  @Column({ type: 'text', nullable: true })
  value: string;

  @ApiProperty({ description: '来源模板配置ID', required: false })
  @Column({ name: 'template_config_id', nullable: true })
  templateConfigId: string;

  @ManyToOne(() => TemplateModuleConfig)
  @JoinColumn({ name: 'template_config_id' })
  templateConfig: TemplateModuleConfig;
}
