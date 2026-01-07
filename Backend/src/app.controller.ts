import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getLanding(@Res() res: Response) {
    res
      .status(200)
      .header('Content-Type', 'text/html')
      .send(this.appService.getLandingPage());
  }
}
