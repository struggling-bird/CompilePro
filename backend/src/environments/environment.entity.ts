import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { EnvironmentNode } from './node.entity';

@Entity('environments')
export class Environment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  url: string;

  @Column({ nullable: true, length: 100 })
  account?: string;

  @Column({ nullable: true, length: 100 })
  password?: string;

  @Column({ name: 'support_remote', type: 'boolean', default: false })
  supportRemote: boolean;

  @Column({ name: 'remote_method', type: 'text', nullable: true })
  remoteMethod?: string;

  @Column({ type: 'text', nullable: true })
  remark?: string;

  @ManyToOne(() => Customer)
  customer: Customer;

  @OneToMany(() => EnvironmentNode, (n) => n.environment)
  nodes: EnvironmentNode[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
