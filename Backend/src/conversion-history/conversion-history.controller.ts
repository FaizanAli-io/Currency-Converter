import {
  Controller,
  Get,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ConversionHistoryService } from './conversion-history.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('history')
export class ConversionHistoryController {
  constructor(private historyService: ConversionHistoryService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getHistory(
    @Request() req: { user?: { id: string } },
    @Query('guestId') guestId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);

    if (req.user) {
      return this.historyService.findByUserId(req.user.id, pageNum, limitNum);
    } else if (guestId) {
      return this.historyService.findByGuestId(guestId, pageNum, limitNum);
    }

    return { data: [], total: 0 };
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Delete()
  async clearHistory(
    @Request() req: { user?: { id: string } },
    @Query('guestId') guestId?: string,
  ) {
    if (req.user) {
      await this.historyService.deleteByUserId(req.user.id);
    } else if (guestId) {
      await this.historyService.deleteByGuestId(guestId);
    }

    return { message: 'History cleared' };
  }
}
