import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('conversion_history')
export class ConversionHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fromCurrency: string;

  @Column()
  toCurrency: string;

  @Column('decimal', { precision: 18, scale: 6 })
  amount: number;

  @Column('decimal', { precision: 18, scale: 6 })
  convertedAmount: number;

  @Column('decimal', { precision: 18, scale: 10 })
  exchangeRate: number;

  @Column({ nullable: true })
  historicalDate: string;

  @Column({ nullable: true })
  guestId: string;

  @ManyToOne(() => User, (user) => user.conversionHistory, { nullable: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
