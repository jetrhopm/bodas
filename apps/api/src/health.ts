import { Controller, Get, Module, ServiceUnavailableException } from '@nestjs/common';
import { PrismaModule, PrismaService } from './prisma';
@Controller('health') export class HealthController {constructor(private prisma:PrismaService){} @Get() live(){return {status:'ok',service:'bodas-api',time:new Date().toISOString()}} @Get('ready') async ready(){try{await this.prisma.$queryRaw`SELECT 1`;return {status:'ready',database:'ok'}}catch{throw new ServiceUnavailableException('Base de datos no disponible')}}}
@Module({imports:[PrismaModule],controllers:[HealthController]}) export class HealthModule{}
