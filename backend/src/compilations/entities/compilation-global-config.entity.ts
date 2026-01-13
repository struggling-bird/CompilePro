import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Compilation } from './compilation.entity';
import { ConfigType } from '../../templates/entities/template-global-config.entity';

@Entity('compilation_global_configs')
export class CompilationGlobalConfig {
  @ApiProperty({ description: '编译全局配置ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '所属编译任务ID' })
  @Column({ name: 'compilation_id' })
  compilationId: string;

  @ManyToOne(() => Compilation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'compilation_id' })
  compilation: Compilation;

  @ApiProperty({ description: '配置名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ enum: ConfigType, description: '配置类型' })
  @Column({ type: 'enum', enum: ConfigType })
  type: ConfigType;

  @ApiProperty({ description: '描述', required: false })
  @Column({ length: 500, nullable: true })
  description: string;

  @ApiProperty({ description: '当前值', required: false })
  @Column({ type: 'text', nullable: true })
  value: string;

  @ApiProperty({ description: '来源模板配置ID', required: false })
  @Column({ name: 'template_config_id', nullable: true })
  templateConfigId: string;
}
