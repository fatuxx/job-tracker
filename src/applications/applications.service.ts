import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';


@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateApplicationDto) {
    return this.prisma.application.create({
      data: {
        ...dto,
        appliedAt: new Date(dto.appliedAt),
        userId,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async update(userId: string, id: string, dto: UpdateApplicationDto) {
    await this.findOne(userId, id);

    return this.prisma.application.update({
      where: { id },
      data: {
        ...dto,
        appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.application.delete({
      where: { id },
    });
  }
}