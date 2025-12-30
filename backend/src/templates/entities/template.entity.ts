import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TemplateVersion } from './template-version.entity';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ length: 50, nullable: true })
  latestVersion: string;

  @Column({ length: 100, nullable: true })
  author: string; // The creator name

  @Column({ length: 100, nullable: true })
  updater: string; // The last updater name

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TemplateVersion, (version) => version.template)
  versions: TemplateVersion[];
}
