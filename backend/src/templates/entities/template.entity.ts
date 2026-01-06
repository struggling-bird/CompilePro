import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TemplateVersion } from './template-version.entity';

@Entity('templates')
export class Template {
  @ApiProperty({ description: '模版ID', example: 'uuid-string' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '模版名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '模版描述', required: false })
  @Column({ length: 500, nullable: true })
  description: string;

  @ApiProperty({ description: '是否启用', default: true })
  @Column({ default: true })
  isEnabled: boolean;

  @ApiProperty({ description: '最新版本号', required: false })
  @Column({ length: 50, nullable: true })
  latestVersion: string;

  @ApiProperty({ description: '作者', required: false })
  @Column({ length: 100, nullable: true })
  author: string; // The creator name

  @ApiProperty({ description: '最后更新者', required: false })
  @Column({ length: 100, nullable: true })
  updater: string; // The last updater name

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ type: () => [TemplateVersion], description: '版本列表' })
  @OneToMany(() => TemplateVersion, (version) => version.template)
  versions: TemplateVersion[];
}
