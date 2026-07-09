import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) { }

  async create(createStudentDto: CreateStudentDto) {
    const { firstName, lastName, parentPhone, ...rest } = createStudentDto;
    
    return this.prisma.student.create({
      data: {
        fullName: `${firstName} ${lastName}`.trim(),
        parentPhone: parentPhone || '',
        ...rest,
      },
    });
  }

  async findAll(query: StudentQueryDto) {
    const { page = 1, limit = 10, search, groupId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
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

    const { firstName, lastName, ...rest } = updateStudentDto;
    
    let fullName: string | undefined = undefined;
    if (firstName !== undefined || lastName !== undefined) {
      const parts = student.fullName.split(' ');
      const currentFirstName = parts[0] || '';
      const currentLastName = parts.slice(1).join(' ') || '';
      
      const newFirstName = firstName !== undefined ? firstName : currentFirstName;
      const newLastName = lastName !== undefined ? lastName : currentLastName;
      
      fullName = `${newFirstName} ${newLastName}`.trim();
    }

    return this.prisma.student.update({
      where: { id },
      data: {
        ...rest,
        ...(fullName !== undefined && { fullName }),
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
