import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CurrencyService, CurrencyRates, CurrencyInfo } from './currency.service';
import { ConversionHistoryService } from '../conversion-history/conversion-history.service';
import { ConvertCurrencyDto } from './dto/currency.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('currency')
export class CurrencyController {
  constructor(
    private currencyService: CurrencyService,
    private conversionHistoryService: ConversionHistoryService,
  ) {}

  @Get('list')
  getCurrencies(): Promise<{ [key: string]: CurrencyInfo }> {
    return this.currencyService.getCurrencies();
  }

  @Get('rates')
  getLatestRates(@Query('base') baseCurrency?: string): Promise<CurrencyRates> {
    return this.currencyService.getLatestRates(baseCurrency || 'USD');
  }

  @Get('historical')
  getHistoricalRates(
    @Query('date') date: string,
    @Query('base') baseCurrency?: string,
  ): Promise<CurrencyRates> {
    return this.currencyService.getHistoricalRates(date, baseCurrency || 'USD');
  }

  @Get('timeseries')
  getTimeSeriesRates(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('base') baseCurrency?: string,
    @Query('currencies') currencies?: string,
  ): Promise<{ [date: string]: CurrencyRates }> {
    const currencyList = currencies ? currencies.split(',') : [];
    return this.currencyService.getTimeSeriesRates(
      startDate,
      endDate,
      baseCurrency || 'USD',
      currencyList,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('convert')
  async convert(
    @Body() convertDto: ConvertCurrencyDto,
    @Request() req: { user?: { id: string } },
  ) {
    const result = await this.currencyService.convert(
      convertDto.fromCurrency,
      convertDto.toCurrency,
      convertDto.amount,
      convertDto.date,
    );

    // Save conversion history
    await this.conversionHistoryService.create({
      fromCurrency: convertDto.fromCurrency,
      toCurrency: convertDto.toCurrency,
      amount: convertDto.amount,
      convertedAmount: result.convertedAmount,
      exchangeRate: result.exchangeRate,
      historicalDate: convertDto.date,
      userId: req.user?.id,
      guestId: !req.user ? convertDto.guestId : undefined,
    });

    return result;
  }
}
