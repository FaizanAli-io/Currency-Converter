import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('request_logs')
export class RequestLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  method: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  guestId: string;

  @Column({ nullable: true, type: 'text' })
  requestBody: string;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ nullable: true })
  responseTime: number;

  @CreateDateColumn()
  createdAt: Date;
}
