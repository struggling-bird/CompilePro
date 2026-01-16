import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectVersion } from './version.entity';

@Entity('meta_projects')
export class MetaProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  gitUrl: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ length: 64 })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ProjectVersion, (v) => v.project)
  versions: ProjectVersion[];
}
