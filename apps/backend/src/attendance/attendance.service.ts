import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async mark(markAttendanceDto: MarkAttendanceDto, markedById: string) {
    const { groupId, date, entries } = markAttendanceDto;

    // Validate group exists
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { students: { select: { id: true } } },
    });
    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }

    const groupStudentIds = new Set(group.students.map((s) => s.id));

    // Validate all students belong to this group
    for (const entry of entries) {
      if (!groupStudentIds.has(entry.studentId)) {
        throw new BadRequestException(
          `Student ${entry.studentId} is not in group ${groupId}`,
        );
      }
    }

    // Upsert attendance records in a transaction
    return this.prisma.$transaction(
      entries.map((entry) =>
        this.prisma.attendance.upsert({
          where: {
            studentId_groupId_date: {
              studentId: entry.studentId,
              groupId,
              date: new Date(date),
            },
          },
          update: {
            status: entry.status,
            note: entry.note,
            markedById,
          },
          create: {
            studentId: entry.studentId,
            groupId,
            date: new Date(date),
            status: entry.status,
            note: entry.note,
            markedById,
          },
        }),
      ),
    );
  }

  async findAll(query: AttendanceQueryDto) {
    const { page = 1, limit = 10, groupId, studentId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (groupId) where.groupId = groupId;
    if (studentId) where.studentId = studentId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: { select: { id: true, fullName: true } },
          group: { select: { id: true, name: true } },
          markedBy: { select: { id: true, fullName: true } },
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.attendance.count({ where }),
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

  async getGroupAttendance(groupId: string, date: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        students: { select: { id: true, fullName: true } },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }

    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        groupId,
        date: new Date(date),
      },
      include: {
        student: { select: { id: true, fullName: true } },
      },
    });

    // Map attendance by studentId for easy lookup
    const attendanceMap = new Map(
      attendanceRecords.map((r) => [r.studentId, r]),
    );

    // Return all students with their attendance status
    return group.students.map((student) => ({
      studentId: student.id,
      fullName: student.fullName,
      attendance: attendanceMap.get(student.id) || null,
    }));
  }

  async remove(id: string) {
    const record = await this.prisma.attendance.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Attendance record ${id} not found`);
    }

    return this.prisma.attendance.delete({ where: { id } });
  }
}
