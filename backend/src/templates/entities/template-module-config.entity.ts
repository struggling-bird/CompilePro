import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TemplateModule } from './template-module.entity';

export enum MappingType {
  GLOBAL = 'GLOBAL',
  FIXED = 'FIXED',
  MANUAL = 'MANUAL',
}

@Entity('template_module_configs')
export class TemplateModuleConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  fileLocation: string;

  @Column({
    type: 'enum',
    enum: MappingType,
  })
  mappingType: MappingType;

  @Column({ type: 'text', nullable: true })
  mappingValue: string;

  @Column({ length: 255, nullable: true })
  regex: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ default: false })
  isHidden: boolean;

  @Column({ default: true })
  isSelected: boolean;

  @ManyToOne(() => TemplateModule, (module) => module.configs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'module_id' })
  module: TemplateModule;

  @Column({ name: 'module_id' })
  moduleId: string;
}
