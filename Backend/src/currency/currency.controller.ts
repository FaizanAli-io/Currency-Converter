import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CurrencyService,
  CurrencyRates,
  CurrencyInfo,
} from './currency.service';
import { ConversionHistoryService } from '../conversion-history/conversion-history.service';
import { ConvertCurrencyDto } from './dto/currency.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('Currency')
@Controller('currency')
export class CurrencyController {
  constructor(
    private currencyService: CurrencyService,
    private conversionHistoryService: ConversionHistoryService,
  ) {}

  @Get('list')
  @ApiOperation({ summary: 'Get list of all supported currencies' })
  @ApiResponse({
    status: 200,
    description: 'List of supported currencies with metadata',
    schema: {
      example: {
        USD: { name: 'US Dollar', symbol: '$' },
        EUR: { name: 'Euro', symbol: '€' },
      },
    },
  })
  getCurrencies(): Promise<{ [key: string]: CurrencyInfo }> {
    return this.currencyService.getCurrencies();
  }

  @Get('rates')
  @ApiOperation({ summary: 'Get latest exchange rates' })
  @ApiQuery({
    name: 'base',
    description: 'Base currency code (default: USD)',
    required: false,
    example: 'USD',
  })
  @ApiResponse({
    status: 200,
    description: 'Latest exchange rates for the base currency',
    schema: {
      example: {
        base: 'USD',
        rates: {
          EUR: 0.92,
          GBP: 0.79,
        },
        timestamp: '2026-01-07T00:00:00Z',
      },
    },
  })
  getLatestRates(@Query('base') baseCurrency?: string): Promise<CurrencyRates> {
    return this.currencyService.getLatestRates(baseCurrency || 'USD');
  }

  @Get('historical')
  @ApiOperation({
    summary: 'Get historical exchange rates for a specific date',
  })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    required: true,
    example: '2025-12-07',
  })
  @ApiQuery({
    name: 'base',
    description: 'Base currency code (default: USD)',
    required: false,
    example: 'USD',
  })
  @ApiResponse({
    status: 200,
    description: 'Historical exchange rates for the specified date',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date format',
  })
  getHistoricalRates(
    @Query('date') date: string,
    @Query('base') baseCurrency?: string,
  ): Promise<CurrencyRates> {
    return this.currencyService.getHistoricalRates(date, baseCurrency || 'USD');
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('convert')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Convert currency amount',
    description:
      'Convert an amount from one currency to another. Authentication is optional; authenticated users will have their conversion history saved.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversion result with exchange rate',
    schema: {
      example: {
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
        convertedAmount: 92,
        exchangeRate: 0.92,
        quota: {
          month: 5000,
          limit: 5000,
          remaining: 4950,
        },
        timestamp: '2026-01-07T00:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid currency code or conversion failed',
  })
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
    });

    return result;
  }
}
