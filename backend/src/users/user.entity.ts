import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../roles/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: 'active' | 'inactive';

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
