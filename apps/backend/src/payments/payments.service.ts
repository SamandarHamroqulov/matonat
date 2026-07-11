import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto, receivedById: string) {
    const { studentId, amount, month, method, note } = createPaymentDto;

    // Validate student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    return this.prisma.payment.create({
      data: {
        studentId,
        amount,
        month: new Date(month),
        method,
        note,
        receivedById,
      },
      include: {
        student: { select: { id: true, fullName: true } },
        receivedBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async findAll(query: PaymentQueryDto) {
    const { page = 1, limit = 10, studentId, method, startDate, endDate, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (studentId) where.studentId = studentId;
    if (method) where.method = method;
    if (search) {
      where.student = {
        fullName: {
          contains: search,
          mode: 'insensitive',
        },
      };
    }

    if (startDate || endDate) {
      where.month = {};
      if (startDate) where.month.gte = new Date(startDate);
      if (endDate) where.month.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: { select: { id: true, fullName: true } },
          receivedBy: { select: { id: true, fullName: true } },
        },
        orderBy: { month: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    // Calculate total amount for the current filter
    const totalAmount = await this.prisma.payment.aggregate({
      where,
      _sum: { amount: true },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalAmount: totalAmount._sum.amount || 0,
      },
    };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, fullName: true, phone: true } },
        receivedBy: { select: { id: true, fullName: true } },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async getStudentPayments(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    const payments = await this.prisma.payment.findMany({
      where: { studentId },
      orderBy: { month: 'desc' },
      include: {
        receivedBy: { select: { id: true, fullName: true } },
      },
    });

    const totalPaid = await this.prisma.payment.aggregate({
      where: { studentId },
      _sum: { amount: true },
    });

    return {
      student: { id: student.id, fullName: student.fullName },
      payments,
      totalPaid: totalPaid._sum.amount || 0,
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.payment.delete({ where: { id } });
  }
}
