import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) { }

  async count() {
    return this.prisma.student.count({ where: { isActive: true } });
  }

  async create(createStudentDto: CreateStudentDto) {
    return this.prisma.student.create({
      data: {
        fullName: createStudentDto.fullName.trim(),
        phone: createStudentDto.phone?.trim() ?? null,
        parentPhone: createStudentDto.parentPhone.trim(),
        birthDate: createStudentDto.birthDate ?? null,
        groupId: createStudentDto.groupId ?? null,
      },
    });
  }

  async findAll(query: StudentQueryDto) {
    const { page = 1, limit = 10, search, groupId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { parentPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (groupId) {
      where.groupId = groupId;
    }

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: { group: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
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
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { group: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.findOne(id); // Check existence

    return this.prisma.student.update({
      where: { id },
      data: {
        fullName: updateStudentDto.fullName?.trim() ?? student.fullName,
        phone: updateStudentDto.phone !== undefined ? updateStudentDto.phone.trim() : student.phone,
        parentPhone: updateStudentDto.parentPhone?.trim() ?? student.parentPhone,
        birthDate:
          updateStudentDto.birthDate !== undefined ? updateStudentDto.birthDate : student.birthDate,
        groupId:
          updateStudentDto.groupId !== undefined ? updateStudentDto.groupId : student.groupId,
        isActive:
          updateStudentDto.isActive !== undefined ? updateStudentDto.isActive : student.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.student.delete({
      where: { id },
    });
  }
}
