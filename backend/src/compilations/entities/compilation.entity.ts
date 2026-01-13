import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CompilationStatus } from '../enums/compilation-status.enum';
import { Template } from '../../templates/entities/template.entity';
import { TemplateVersion } from '../../templates/entities/template-version.entity';
import { Customer } from '../../customers/customer.entity';
import { Environment } from '../../environments/environment.entity';

@Entity('compilations')
export class Compilation {
  @ApiProperty({ description: '编译任务ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '任务名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '任务描述', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ enum: CompilationStatus, description: '任务状态' })
  @Column({
    type: 'enum',
    enum: CompilationStatus,
    default: CompilationStatus.IDLE,
  })
  status: CompilationStatus;

  @ApiProperty({ description: '全局配置值', type: 'array' })
  @Column({ type: 'json', nullable: true })
  globalConfigs: { configId: string; value: string }[];

  @ApiProperty({ description: '模块配置值', type: 'array' })
  @Column({ type: 'json', nullable: true })
  moduleConfigs: { moduleId: string; configId: string; value: string }[];

  @ApiProperty({ description: '最后构建时间', required: false })
  @Column({ type: 'timestamp', nullable: true })
  lastBuildTime: Date;

  @ApiProperty({ description: '最后构建人', required: false })
  @Column({ length: 100, nullable: true })
  lastBuilder: string;

  @ApiProperty({ description: '创建人' })
  @Column({ length: 100 })
  createdBy: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations

  @ApiProperty({ description: '所属模版ID' })
  @Column({ name: 'template_id' })
  templateId: string;

  @ManyToOne(() => Template)
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @ApiProperty({ description: '所属模版版本ID' })
  @Column({ name: 'template_version_id' })
  templateVersionId: string;

  @ManyToOne(() => TemplateVersion)
  @JoinColumn({ name: 'template_version_id' })
  templateVersion: TemplateVersion;

  @ApiProperty({ description: '所属客户ID' })
  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ApiProperty({ description: '所属环境ID' })
  @Column({ name: 'environment_id' })
  environmentId: string;

  @ManyToOne(() => Environment)
  @JoinColumn({ name: 'environment_id' })
  environment: Environment;
}
