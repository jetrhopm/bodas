import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth';
import { WeddingsModule } from './weddings';
import { PublicModule } from './public';
import { HealthModule } from './health';
@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, WeddingsModule, PublicModule, HealthModule] })
export class AppModule {}
