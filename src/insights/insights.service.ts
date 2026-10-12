import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClaudeService } from './claude.service';

@Injectable()
export class InsightsService {
  constructor(
    private prisma: PrismaService,
    private claude: ClaudeService,
  ) {}

  async generate(userId: string) {
    const applications = await this.prisma.application.findMany({
      where: { userId },
      orderBy: { appliedAt: 'desc' },
    });

    if (applications.length === 0) {
      return { insights: 'No applications yet. Start by adding some to get insights.' };
    }

    const prompt = this.buildPrompt(applications);
    const insights = await this.claude.generateInsights(prompt);

    return { insights, applicationCount: applications.length };
  }

  private buildPrompt(applications: any[]): string {
    const summary = applications.map((app) => ({
      company: app.company,
      role: app.role,
      status: app.status,
      salaryMin: app.salaryMin,
      salaryMax: app.salaryMax,
      appliedAt: app.appliedAt.toISOString().split('T')[0],
      source: app.source,
      notes: app.notes,
    }));

    return `You are a career coach helping a software engineer with their job search. Here is their application history as JSON:

${JSON.stringify(summary, null, 2)}

Please provide:
1. A short summary of their job search activity (volume, success rate, patterns)
2. Any patterns you notice (which companies respond, which don't, salary ranges, sources that work best)
3. Two or three concrete suggestions for improvement

Keep it concise and actionable. No corporate fluff.`;
  }
}