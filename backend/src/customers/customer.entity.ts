import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: 'active' | 'inactive';

  @Column({
    name: 'contact_person',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  contactPerson?: string;

  @Column({
    name: 'contact_phone',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  contactPhone?: string;

  @Column({
    name: 'contact_email',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  contactEmail?: string;

  @Column({ name: 'contract_date', type: 'date', nullable: true })
  contractDate?: string;

  @Column({ name: 'contact_address', type: 'text', nullable: true })
  contactAddress?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
