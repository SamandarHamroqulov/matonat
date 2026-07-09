import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, authorId: string) {
    return this.prisma.announcement.create({
      data: {
        ...createAnnouncementDto,
        authorId,
      },
      include: {
        author: { select: { id: true, fullName: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.announcement.findMany({
      orderBy: { publishedAt: 'desc' },
      include: {
        author: { select: { id: true, fullName: true } },
      },
      take: 50,
    });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, fullName: true } },
      },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement ${id} not found`);
    }

    return announcement;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.announcement.delete({ where: { id } });
  }
}
