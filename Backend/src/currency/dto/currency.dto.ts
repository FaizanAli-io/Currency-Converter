import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class ConvertCurrencyDto {
  @IsNotEmpty()
  @IsString()
  fromCurrency: string;

  @IsNotEmpty()
  @IsString()
  toCurrency: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  guestId?: string;
}

export class GetHistoricalRatesDto {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  baseCurrency?: string;
}
