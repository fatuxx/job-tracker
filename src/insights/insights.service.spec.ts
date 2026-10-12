import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService } from './insights.service';
import { ClaudeService } from './claude.service';
import { PrismaService } from '../prisma/prisma.service';

// The real ClaudeService pulls in @nestjs/config (ESM-only), which Jest can't parse.
// We only need it as a DI token here, so stub the module out.
jest.mock('./claude.service', () => ({
  ClaudeService: class ClaudeService {},
}));

describe('InsightsService', () => {
  let service: InsightsService;

  const prismaMock = {
    application: {
      findMany: jest.fn(),
    },
  };

  const claudeMock = {
    generateInsights: jest.fn(),
  };

  const userId = 'user-123';

  const applications = [
    {
      id: 'app-1',
      userId,
      company: 'Acme',
      role: 'Backend Engineer',
      status: 'INTERVIEW',
      salaryMin: 90000,
      salaryMax: 120000,
      appliedAt: new Date('2026-09-15T10:30:00Z'),
      source: 'LinkedIn',
      notes: 'Referred by a friend',
      createdAt: new Date('2026-09-15T10:30:00Z'),
      updatedAt: new Date('2026-09-20T10:30:00Z'),
    },
    {
      id: 'app-2',
      userId,
      company: 'Globex',
      role: 'Full Stack Developer',
      status: 'REJECTED',
      salaryMin: null,
      salaryMax: null,
      appliedAt: new Date('2026-09-01T08:00:00Z'),
      source: null,
      notes: null,
      createdAt: new Date('2026-09-01T08:00:00Z'),
      updatedAt: new Date('2026-09-10T08:00:00Z'),
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ClaudeService, useValue: claudeMock },
      ],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('generates insights for a user with applications', async () => {
      prismaMock.application.findMany.mockResolvedValue(applications);
      claudeMock.generateInsights.mockResolvedValue('You are doing great.');

      const result = await service.generate(userId);

      expect(prismaMock.application.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { appliedAt: 'desc' },
      });
      expect(claudeMock.generateInsights).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        insights: 'You are doing great.',
        applicationCount: 2,
      });
    });

    it('returns an empty-state message when the user has no applications', async () => {
      prismaMock.application.findMany.mockResolvedValue([]);

      const result = await service.generate(userId);

      expect(result).toEqual({
        insights: 'No applications yet. Start by adding some to get insights.',
      });
      expect(claudeMock.generateInsights).not.toHaveBeenCalled();
    });

    it('calls Claude with a properly formatted prompt', async () => {
      prismaMock.application.findMany.mockResolvedValue(applications);
      claudeMock.generateInsights.mockResolvedValue('insights');

      await service.generate(userId);

      const prompt: string = claudeMock.generateInsights.mock.calls[0][0];

      expect(prompt).toContain('You are a career coach');
      expect(prompt).toContain('1. A short summary');
      expect(prompt).toContain('2. Any patterns you notice');
      expect(prompt).toContain('3. Two or three concrete suggestions');

      // Embedded JSON contains only the summarized fields, with dates as YYYY-MM-DD
      const json = prompt.match(/\[[\s\S]*\]/)?.[0];
      expect(json).toBeDefined();
      expect(JSON.parse(json!)).toEqual([
        {
          company: 'Acme',
          role: 'Backend Engineer',
          status: 'INTERVIEW',
          salaryMin: 90000,
          salaryMax: 120000,
          appliedAt: '2026-09-15',
          source: 'LinkedIn',
          notes: 'Referred by a friend',
        },
        {
          company: 'Globex',
          role: 'Full Stack Developer',
          status: 'REJECTED',
          salaryMin: null,
          salaryMax: null,
          appliedAt: '2026-09-01',
          source: null,
          notes: null,
        },
      ]);

      // Internal fields must not leak into the prompt
      expect(prompt).not.toContain('app-1');
      expect(prompt).not.toContain(userId);
    });
  });
});
