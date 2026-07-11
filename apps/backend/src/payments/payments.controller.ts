import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/authenticated-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @Request() req: { user: AuthenticatedUser }) {
    return this.paymentsService.create(createPaymentDto, req.user.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get()
  findAll(@Query() query: PaymentQueryDto) {
    return this.paymentsService.findAll(query);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('student/:studentId')
  getStudentPayments(@Param('studentId') studentId: string) {
    return this.paymentsService.getStudentPayments(studentId);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
