import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, comment: '原始文件名' })
  originalName: string;

  @Column({ length: 255, unique: true, comment: '系统生成文件名' })
  filename: string;

  @Column({ length: 100, comment: 'MIME类型' })
  mimetype: string;

  @Column('bigint', { comment: '文件大小(字节)' })
  size: number;

  @Column({ length: 500, comment: '存储路径或Key' })
  path: string;

  @Column({ length: 50, default: 'local', comment: '存储提供商类型' })
  storageType: string;

  @Column({ nullable: true, comment: '上传用户ID' })
  userId: string;

  @Column({ default: false, comment: '是否临时文件' })
  isTemp: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '临时文件过期时间',
  })
  expiresAt: Date;

  @Column({ length: 64, nullable: true, comment: 'MD5校验和' })
  checksumMd5?: string;

  @Column({ length: 64, nullable: true, comment: 'SHA256校验和' })
  checksumSha256?: string;

  @Column({ default: false, comment: '是否加密存储' })
  isEncrypted: boolean;

  @Column({
    type: 'varchar',
    length: 32,
    nullable: true,
    comment: '加密初始化向量(Hex)',
  })
  encryptionIv?: string;

  @Column({
    type: 'varchar',
    length: 16,
    nullable: true,
    comment: '病毒扫描状态',
  })
  scanStatus?: 'clean' | 'infected' | 'unknown';

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
