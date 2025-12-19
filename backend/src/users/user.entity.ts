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

  @Column({ default: false })
  isSuperAdmin: boolean;

  @Column({
    type: 'bigint',
    default: 1073741824,
    comment: '存储配额(字节), 默认1GB',
  })
  storageQuota: number;

  @Column({ type: 'bigint', default: 0, comment: '已用存储空间(字节)' })
  usedStorage: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
