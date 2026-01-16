import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MetaProject } from './metaproject.entity';
import { VersionConfig } from './version_config.entity';

export type VersionStatus = 'enabled' | 'disabled';
export type SourceType = 'branch' | 'tag';

@Entity('project_versions')
export class ProjectVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MetaProject, (p) => p.versions, { onDelete: 'CASCADE' })
  project: MetaProject;

  @Column({ length: 32 })
  version: string;

  @Column({ length: 16 })
  sourceType: SourceType;

  @Column({ length: 128 })
  sourceValue: string;

  @Column({ length: 200, nullable: true })
  summary?: string;

  @Column({ type: 'text', nullable: true })
  readmeDoc?: string;

  @Column({ type: 'text', nullable: true })
  buildDoc?: string;

  @Column({ type: 'text', nullable: true })
  updateDoc?: string;

  @Column({ type: 'json', nullable: true })
  compileCommands?: string[];

  @Column({ type: 'json', nullable: true })
  artifacts?: string[];

  @Column({ length: 16, default: 'enabled' })
  status: VersionStatus;

  @Column({ length: 64 })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => VersionConfig, (c) => c.version)
  configs: VersionConfig[];
}
