// src/attendance/attendance.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async mark(dto: MarkAttendanceDto, markedById: string) {
    const { groupId, date, entries } = dto;

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { students: { select: { id: true } } },
    });

    if (!group) {
      throw new NotFoundException(`Guruh topilmadi`);
    }

    const groupStudentIds = new Set(group.students.map((s) => s.id));

    for (const entry of entries) {
      if (!groupStudentIds.has(entry.studentId)) {
        throw new BadRequestException(
          `O'quvchi bu guruhga tegishli emas: ${entry.studentId}`,
        );
      }
    }

    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const results = await Promise.all(
      entries.map((entry) =>
        this.prisma.attendance.upsert({
          where: {
            studentId_groupId_date: {
              studentId: entry.studentId,
              groupId,
              date: attendanceDate,
            },
          },
          update: {
            status: entry.status,
            note: entry.note ?? null,
            markedById,
          },
          create: {
            date: attendanceDate,
            status: entry.status,
            note: entry.note ?? null,
            student: {
              connect: {
                id: entry.studentId,
              },
            },
            group: {
              connect: {
                id: groupId,
              },
            },
            markedBy: {
              connect: {
                id: markedById,
              },
            },
          },
        }),
      ),
    );

    return results;
  }

  async findAll(query: AttendanceQueryDto) {
    const { page = 1, limit = 20, groupId, studentId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {};

    if (groupId) where.groupId = groupId;
    if (studentId) where.studentId = studentId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setUTCHours(0, 0, 0, 0);
        where.date.gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setUTCHours(23, 59, 59, 999);
        where.date.lte = e;
      }
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
        students: {
          where: { isActive: true },
          select: { id: true, fullName: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Guruh topilmadi`);
    }

    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const attendanceRecords = await this.prisma.attendance.findMany({
      where: { groupId, date: attendanceDate },
    });

    const attendanceMap = new Map(
      attendanceRecords.map((r) => [r.studentId, r]),
    );

    return {
      groupId: group.id,
      groupName: group.name,
      date: attendanceDate,
      students: group.students.map((student) => ({
        studentId: student.id,
        fullName: student.fullName,
        attendance: attendanceMap.get(student.id) ?? null,
      })),
    };
  }

  async getTodaySummary() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [present, absent, late, total] = await Promise.all([
      this.prisma.attendance.count({
        where: { date: { gte: today, lt: tomorrow }, status: 'PRESENT' },
      }),
      this.prisma.attendance.count({
        where: { date: { gte: today, lt: tomorrow }, status: 'ABSENT' },
      }),
      this.prisma.attendance.count({
        where: { date: { gte: today, lt: tomorrow }, status: 'LATE' },
      }),
      this.prisma.attendance.count({
        where: { date: { gte: today, lt: tomorrow } },
      }),
    ]);

    return {
      date: today,
      present,
      absent,
      late,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  }

  async getStudentAttendance(studentId: string, groupId?: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`O'quvchi topilmadi`);
    }

    const where: Record<string, any> = { studentId };
    if (groupId) where.groupId = groupId;

    const records = await this.prisma.attendance.findMany({
      where,
      include: {
        group: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: 30,
    });

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;

    return {
      student: { id: student.id, fullName: student.fullName },
      summary: {
        total,
        present,
        absent,
        late,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      },
      records,
    };
  }

  async remove(id: string) {
    const record = await this.prisma.attendance.findUnique({ where: { id } });

    if (!record) {
      throw new NotFoundException(`Davomat yozuvi topilmadi`);
    }

    return this.prisma.attendance.delete({ where: { id } });
  }
}
