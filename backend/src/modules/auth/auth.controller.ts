import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ PÚBLICO - Registro normal
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ✅ PÚBLICO - Login normal
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ✅ PÚBLICO - Login con Google (NO requiere JWT)
  @Post('google')
  googleLogin(@Body('token') token: string) {
    console.log('📥 Recibido token de Google:', token?.substring(0, 20) + '...');
    return this.authService.googleLogin(token);
  }

  // 🔒 PRIVADO - Solo usuarios autenticados
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }
}