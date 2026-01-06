import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CurrencyModule } from './currency/currency.module';
import { ConversionHistoryModule } from './conversion-history/conversion-history.module';
import { RequestLogModule } from './request-log/request-log.module';
import { RequestLogInterceptor } from './request-log/request-log.interceptor';
import { User } from './users/user.entity';
import { ConversionHistory } from './conversion-history/conversion-history.entity';
import { RequestLog } from './request-log/request-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [User, ConversionHistory, RequestLog],
        synchronize: true, // Set to false in production
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CurrencyModule,
    ConversionHistoryModule,
    RequestLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLogInterceptor,
    },
  ],
})
export class AppModule {}
