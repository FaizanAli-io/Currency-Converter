import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversionHistory } from './conversion-history.entity';

interface CreateConversionDto {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  exchangeRate: number;
  historicalDate?: string;
  userId?: string;
}

@Injectable()
export class ConversionHistoryService {
  constructor(
    @InjectRepository(ConversionHistory)
    private historyRepository: Repository<ConversionHistory>,
  ) {}

  async create(data: CreateConversionDto): Promise<ConversionHistory> {
    const history = this.historyRepository.create({
      fromCurrency: data.fromCurrency,
      toCurrency: data.toCurrency,
      amount: data.amount,
      convertedAmount: data.convertedAmount,
      exchangeRate: data.exchangeRate,
      historicalDate: data.historicalDate,
    });
    if (data.userId) {
      history.user = { id: data.userId } as any;
    }
    return this.historyRepository.save(history);
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 5,
  ): Promise<{ data: ConversionHistory[]; total: number }> {
    const [data, total] = await this.historyRepository.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async findByGuest(
    page: number = 1,
    limit: number = 5,
  ): Promise<{ data: ConversionHistory[]; total: number }> {
    const [data, total] = await this.historyRepository.findAndCount({
      where: { user: null as any },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.historyRepository.delete({ user: { id: userId } });
  }

  async deleteGuestHistory(): Promise<void> {
    await this.historyRepository.delete({ user: null as any });
  }
}
