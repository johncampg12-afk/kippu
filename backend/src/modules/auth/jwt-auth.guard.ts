import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // ✅ IGNORAR PREFLIGHT OPTIONS - CRÍTICO PARA CORS
    if (request.method === 'OPTIONS') {
      return true;
    }
    
    // Lógica normal de autenticación JWT
    return super.canActivate(context);
  }
}