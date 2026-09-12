import { Body, CanActivate, Controller, ExecutionContext, Injectable, Module, Post, UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import * as argon2 from 'argon2';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { PrismaModule, PrismaService } from './prisma';
class LoginDto { @IsEmail() email!: string; @IsString() @MinLength(8) password!: string; }
@Injectable() export class AuthGuard implements CanActivate { constructor(private jwt: JwtService) {} canActivate(c: ExecutionContext) { const token=c.switchToHttp().getRequest().headers.authorization?.replace('Bearer ',''); if(!token) throw new UnauthorizedException(); try { c.switchToHttp().getRequest().user=this.jwt.verify(token); return true; } catch { throw new UnauthorizedException('Sesión inválida o vencida'); } } }
@Injectable() export class AuthService { constructor(private prisma:PrismaService, private jwt:JwtService){} async login(dto:LoginDto){ const user=await this.prisma.user.findUnique({where:{email:dto.email}}); if(!user||!user.active||!(await argon2.verify(user.passwordHash,dto.password))) throw new UnauthorizedException('Correo o contraseña incorrectos'); return {accessToken:this.jwt.sign({sub:user.id,role:user.role}),user:{id:user.id,name:user.name,role:user.role}}; } }
@ApiTags('auth') @Controller('auth') export class AuthController { constructor(private service:AuthService){} @Post('login') login(@Body() dto:LoginDto){return this.service.login(dto)} }
@Module({imports:[PrismaModule,JwtModule.register({secret:process.env.JWT_SECRET||'development-secret-change-me',signOptions:{expiresIn:'15m'}})],providers:[AuthService,AuthGuard],controllers:[AuthController],exports:[AuthGuard,JwtModule]}) export class AuthModule {}
