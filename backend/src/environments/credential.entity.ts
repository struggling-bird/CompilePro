import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { EnvironmentNode } from './node.entity';

@Entity('node_credentials')
export class NodeCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 40 })
  type: string;

  @Column({ length: 100 })
  username: string;

  @Column({ length: 100 })
  password: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => EnvironmentNode, (n) => n.credentials)
  node: EnvironmentNode;
}
