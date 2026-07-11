// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();  // hech qanday option yo'q
  }

  get user() { return this.client.user; }
  get student() { return this.client.student; }
  get group() { return this.client.group; }
  get teacherProfile() { return this.client.teacherProfile; }
  get course() { return this.client.course; }
  get schedule() { return this.client.schedule; }
  get attendance() { return this.client.attendance; }
  get payment() { return this.client.payment; }
  get telegramUser() { return this.client.telegramUser; }
  get notification() { return this.client.notification; }
  get announcement() { return this.client.announcement; }
  get refreshToken() { return this.client.refreshToken; }

  $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
  $transaction<T>(ops: Promise<T>[]): Promise<T[]>;
  async $transaction(fnOrOps: any): Promise<any> {
    return this.client.$transaction(fnOrOps);
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}