import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 200, nullable: true })
  description?: string;

  @Column({ type: 'json', nullable: true })
  permissions?: Record<string, any>;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
