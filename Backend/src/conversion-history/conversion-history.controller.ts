import {
  Controller,
  Get,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ConversionHistoryService } from './conversion-history.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('History')
@Controller('history')
export class ConversionHistoryController {
  constructor(private historyService: ConversionHistoryService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get conversion history',
    description:
      'Retrieve conversion history for authenticated users or guests. Guests share a common history (user is null).',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination (default: 1)',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of records per page (default: 5)',
    required: false,
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated conversion history',
    schema: {
      example: {
        data: [
          {
            id: 'history-uuid',
            fromCurrency: 'USD',
            toCurrency: 'EUR',
            amount: 100,
            convertedAmount: 92,
            exchangeRate: 0.92,
            timestamp: '2026-01-07T12:00:00Z',
          },
        ],
        total: 50,
      },
    },
  })
  async getHistory(
    @Request() req: { user?: { id: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '5', 10);

    if (req.user) {
      return this.historyService.findByUserId(req.user.id, pageNum, limitNum);
    }
    return this.historyService.findByGuest(pageNum, limitNum);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Delete()
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Clear conversion history',
    description:
      'Delete all conversion history for authenticated users or guests.',
  })
  @ApiResponse({
    status: 200,
    description: 'History cleared successfully',
    schema: {
      example: {
        message: 'History cleared',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Missing guestId for unauthenticated requests',
  })
  async clearHistory(@Request() req: { user?: { id: string } }) {
    if (req.user) {
      await this.historyService.deleteByUserId(req.user.id);
    } else {
      await this.historyService.deleteGuestHistory();
    }

    return { message: 'History cleared' };
  }
}
