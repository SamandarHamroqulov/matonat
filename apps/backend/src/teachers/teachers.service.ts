import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherQueryDto } from './dto/teacher-query.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const { fullName, email, password, phone, subject, salary } = createTeacherDto;

    // Check if email already exists
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create User + TeacherProfile in a transaction
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          phone,
          role: Role.TEACHER,
        },
      });

      const profile = await tx.teacherProfile.create({
        data: {
          userId: user.id,
          subject,
          salary: salary ?? 0,
          generatedLogin: email,
          generatedPassword: password, // shown once, should be cleared after first login
        },
      });

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        profileId: profile.id,
        subject: profile.subject,
        salary: profile.salary,
        generatedLogin: profile.generatedLogin,
        generatedPassword: profile.generatedPassword,
        createdAt: user.createdAt,
      };
    });
  }

  async findAll(query: TeacherQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      role: Role.TEACHER,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          teacherProfile: {
            include: { groups: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
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
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.TEACHER },
      include: {
        teacherProfile: {
          include: { groups: { include: { course: true } } },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    const teacher = await this.findOne(id);

    const { fullName, phone, isActive, subject, salary } = updateTeacherDto;

    return this.prisma.$transaction(async (tx) => {
      // Update User fields
      if (fullName !== undefined || phone !== undefined || isActive !== undefined) {
        await tx.user.update({
          where: { id },
          data: {
            ...(fullName !== undefined && { fullName }),
            ...(phone !== undefined && { phone }),
            ...(isActive !== undefined && { isActive }),
          },
        });
      }

      // Update TeacherProfile fields
      if (teacher.teacherProfile && (subject !== undefined || salary !== undefined)) {
        await tx.teacherProfile.update({
          where: { id: teacher.teacherProfile.id },
          data: {
            ...(subject !== undefined && { subject }),
            ...(salary !== undefined && { salary }),
          },
        });
      }

      return this.findOne(id);
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Cascade: deleting the User will cascade to TeacherProfile
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
