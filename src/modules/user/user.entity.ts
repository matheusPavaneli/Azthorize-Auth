import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum IProvider {
  GOOGLE = 'google',
  DEFAULT = 'default',
  AZURE = 'azure',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: true, type: 'varchar' })
  name: string;

  @Column({ length: 32, nullable: true, unique: true, type: 'varchar' })
  username: string;

  @Column({ length: 256, nullable: false, unique: true, type: 'varchar' })
  email: string;

  @Column({ length: 256, nullable: false, unique: true, type: 'varchar' })
  emailHash: string;

  @Column({ length: 256, nullable: false, unique: true, type: 'varchar' })
  iv: string;

  @Column({ length: 256, nullable: true, type: 'varchar' })
  password: string;

  @Column({ nullable: false, default: false, type: 'boolean' })
  isVerified: boolean;

  @Column({ nullable: true, type: 'varchar' })
  twoFactorSecret?: string | null;

  @Column({ nullable: false, type: 'boolean', default: false })
  twoFactorEnabled?: boolean;

  @Column({
    nullable: false,
    type: 'enum',
    default: IProvider.DEFAULT,
    enum: IProvider,
  })
  provider: IProvider;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  private originalPassword: string;

  @AfterLoad()
  loadOriginalPassword(): void {
    if (this.password) this.originalPassword = this.password;
  }

  @BeforeInsert()
  async hashPasswordBeforeInsert(): Promise<void> {
    if (this.password) this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate(): Promise<void> {
    if (this.password && this.password !== this.originalPassword) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(passwordToCompare: string): Promise<boolean> {
    return bcrypt.compare(passwordToCompare, this.password);
  }
}
