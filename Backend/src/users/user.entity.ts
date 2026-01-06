import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ConversionHistory } from '../conversion-history/conversion-history.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  otp?: string;

  @Column({ nullable: true, type: 'timestamp' })
  otpExpiry?: Date;

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetTokenExpiry?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ConversionHistory, (history) => history.user)
  conversionHistory: ConversionHistory[];
}
