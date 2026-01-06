import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConvertCurrencyDto {
  @ApiProperty({
    description: 'Source currency code (ISO 4217)',
    example: 'USD',
  })
  @IsNotEmpty()
  @IsString()
  fromCurrency: string;

  @ApiProperty({
    description: 'Target currency code (ISO 4217)',
    example: 'EUR',
  })
  @IsNotEmpty()
  @IsString()
  toCurrency: string;

  @ApiProperty({
    description: 'Amount to convert',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Date for historical rate (YYYY-MM-DD format, optional)',
    example: '2025-12-07',
    required: false,
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({
    description: 'Guest ID for tracking conversions without authentication',
    example: '6076ac44-ddd7-4197-a717-07c31c46ebed',
    required: false,
  })
  @IsOptional()
  @IsString()
  guestId?: string;
}

export class GetHistoricalRatesDto {
  @ApiProperty({
    description: 'Historical date in YYYY-MM-DD format',
    example: '2025-12-07',
  })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Base currency code (optional, default: USD)',
    example: 'USD',
    required: false,
  })
  @IsOptional()
  @IsString()
  baseCurrency?: string;
}
