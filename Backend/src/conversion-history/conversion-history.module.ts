import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversionHistory } from './conversion-history.entity';
import { ConversionHistoryService } from './conversion-history.service';
import { ConversionHistoryController } from './conversion-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConversionHistory])],
  providers: [ConversionHistoryService],
  controllers: [ConversionHistoryController],
  exports: [ConversionHistoryService],
})
export class ConversionHistoryModule {}
