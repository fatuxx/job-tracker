import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightsController {
  constructor(private insightsService: InsightsService) {}

  @Get()
  generate(@Req() req: any) {
    return this.insightsService.generate(req.user.userId);
  }
}