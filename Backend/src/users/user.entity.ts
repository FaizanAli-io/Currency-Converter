import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { ConversionHistory } from '../conversion-history/conversion-history.entity';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 'uuid-string',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column()
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
  })
  @Column({ nullable: true })
  name?: string;

  @ApiProperty({
    description: 'Email verification status',
    example: false,
  })
  @Column({ default: false })
  isEmailVerified: boolean;

  @ApiHideProperty()
  @Column({ nullable: true })
  otp?: string;

  @ApiHideProperty()
  @Column({ nullable: true, type: 'timestamp' })
  otpExpiry?: Date;

  @ApiHideProperty()
  @Column({ nullable: true })
  resetToken?: string;

  @ApiHideProperty()
  @Column({ nullable: true, type: 'timestamp' })
  resetTokenExpiry?: Date;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2026-01-07T12:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-01-07T12:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'User conversion history records',
    type: () => [ConversionHistory],
  })
  @OneToMany(() => ConversionHistory, (history) => history.user)
  conversionHistory: ConversionHistory[];
}
