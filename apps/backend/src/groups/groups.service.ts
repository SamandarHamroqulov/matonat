import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupQueryDto } from './dto/group-query.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    // Validate teacher exists
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { id: createGroupDto.teacherId },
    });
    if (!teacher) {
      throw new BadRequestException(`Teacher profile ${createGroupDto.teacherId} not found`);
    }

    // Validate course exists
    const course = await this.prisma.course.findUnique({
      where: { id: createGroupDto.courseId },
    });
    if (!course) {
      throw new BadRequestException(`Course ${createGroupDto.courseId} not found`);
    }

    return this.prisma.group.create({
      data: createGroupDto,
      include: {
        teacher: { include: { user: { select: { fullName: true, email: true } } } },
        course: true,
      },
    });
  }

  async findAll(query: GroupQueryDto) {
    const { page = 1, limit = 10, search, teacherId, courseId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        skip,
        take: limit,
        include: {
          teacher: { include: { user: { select: { fullName: true, email: true } } } },
          course: true,
          _count: { select: { students: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: { select: { fullName: true, email: true } } } },
        course: true,
        students: true,
        schedules: true,
        _count: { select: { students: true, attendances: true } },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    await this.findOne(id);

    return this.prisma.group.update({
      where: { id },
      data: updateGroupDto,
      include: {
        teacher: { include: { user: { select: { fullName: true, email: true } } } },
        course: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.group.delete({
      where: { id },
    });
  }
}
