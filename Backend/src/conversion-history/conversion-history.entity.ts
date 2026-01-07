import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';

@Entity('conversion_history')
export class ConversionHistory {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'uuid-string',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Source currency code',
    example: 'USD',
  })
  @Column()
  fromCurrency: string;

  @ApiProperty({
    description: 'Target currency code',
    example: 'EUR',
  })
  @Column()
  toCurrency: string;

  @ApiProperty({
    description: 'Original amount',
    example: 100,
    type: 'number',
  })
  @Column('decimal', { precision: 18, scale: 6 })
  amount: number;

  @ApiProperty({
    description: 'Converted amount',
    example: 92,
    type: 'number',
  })
  @Column('decimal', { precision: 18, scale: 6 })
  convertedAmount: number;

  @ApiProperty({
    description: 'Exchange rate used',
    example: 0.92,
    type: 'number',
  })
  @Column('decimal', { precision: 18, scale: 10 })
  exchangeRate: number;

  @ApiProperty({
    description: 'Date for historical conversion',
    example: '2025-12-07',
    required: false,
  })
  @Column({ nullable: true })
  historicalDate: string;

  @ApiProperty({
    description: 'Associated user (for authenticated users)',
    type: () => User,
    required: false,
  })
  @ManyToOne(() => User, (user) => user.conversionHistory, { nullable: true })
  user: User;

  @ApiProperty({
    description: 'Conversion timestamp',
    example: '2026-01-07T12:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;
}
