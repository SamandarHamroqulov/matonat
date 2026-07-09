import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { GroupsModule } from './groups/groups.module';
import { TeachersModule } from './teachers/teachers.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TelegramModule } from './telegram/telegram.module';
import { AnnouncementsModule } from './announcements/announcements.module';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, UsersModule, StudentsModule, GroupsModule, TeachersModule, AttendanceModule, PaymentsModule, NotificationsModule, TelegramModule, AnnouncementsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
