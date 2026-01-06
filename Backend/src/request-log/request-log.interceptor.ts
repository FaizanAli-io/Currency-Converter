import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestLogService } from './request-log.service';

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  constructor(private requestLogService: RequestLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          this.logRequest(request, response.statusCode, responseTime);
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error.status || 500;
          this.logRequest(request, statusCode, responseTime);
        },
      }),
    );
  }

  private async logRequest(
    request: any,
    statusCode: number,
    responseTime: number,
  ) {
    const ipAddress =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.ip;

    await this.requestLogService.create({
      method: request.method,
      url: request.originalUrl || request.url,
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      userAgent: request.headers['user-agent'],
      userId: request.user?.id,
      guestId: request.body?.guestId || request.query?.guestId,
      requestBody:
        request.method !== 'GET' ? JSON.stringify(request.body) : undefined,
      statusCode,
      responseTime,
    });
  }
}
