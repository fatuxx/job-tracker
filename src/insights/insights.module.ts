import { Module } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { ClaudeService } from './claude.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [InsightsController],
  providers: [InsightsService, ClaudeService],
})
export class InsightsModule {}