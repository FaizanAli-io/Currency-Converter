import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLog } from './request-log.entity';
import { RequestLogService } from './request-log.service';
import { RequestLogInterceptor } from './request-log.interceptor';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([RequestLog])],
  providers: [RequestLogService, RequestLogInterceptor],
  exports: [RequestLogService, RequestLogInterceptor],
})
export class RequestLogModule {}
