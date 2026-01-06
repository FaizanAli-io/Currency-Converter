import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestLog } from './request-log.entity';

@Injectable()
export class RequestLogService {
  constructor(
    @InjectRepository(RequestLog)
    private requestLogRepository: Repository<RequestLog>,
  ) {}

  async create(data: Partial<RequestLog>): Promise<RequestLog> {
    const log = this.requestLogRepository.create(data);
    return this.requestLogRepository.save(log);
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: RequestLog[]; total: number }> {
    const [data, total] = await this.requestLogRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }
}
