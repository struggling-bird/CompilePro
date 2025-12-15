import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Environment } from './environment.entity';
import { NodeCredential } from './credential.entity';

@Entity('environment_nodes')
export class EnvironmentNode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  ip: string;

  @Column({ length: 100 })
  host: string;

  @Column({ length: 120, nullable: true })
  domain?: string;

  @Column({ length: 50 })
  memory: string;

  @Column({ length: 50 })
  cpu: string;

  @Column({ length: 50 })
  chip: string;

  @Column({ length: 100 })
  os: string;

  @Column({ name: 'disk_type', length: 50 })
  diskType: string;

  @Column({ name: 'disk_size', length: 50 })
  diskSize: string;

  @Column({ type: 'text', nullable: true })
  remark?: string;

  @ManyToOne(() => Environment, (e) => e.nodes)
  environment: Environment;

  @OneToMany(() => NodeCredential, (c) => c.node)
  credentials: NodeCredential[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
