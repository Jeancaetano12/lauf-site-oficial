import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const bypassToken = request.headers['x-developer-bypass-token'];
    const secretToken = process.env.DEVELOPER_BYPASS_TOKEN;

    // Segurança adicional: O token deve estar configurado e ter pelo menos 16 caracteres para ser válido.
    if (secretToken && secretToken.trim().length >= 16 && bypassToken === secretToken) {
      request.user = {
        id: 'developer-bypass-id',
        nome: 'DESENVOLVEDOR (BYPASS)',
        matricula: 'DESENVOLVEDOR',
        telefone: '00000000000',
        cargo: 'COORDENADOR', // Força cargo COORDENADOR para passar pelos Guards de Roles
        email: 'dev@lauf.com',
      };
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Acesso negado. Token inválido ou não fornecido.');
    }
    return user;
  }
}
