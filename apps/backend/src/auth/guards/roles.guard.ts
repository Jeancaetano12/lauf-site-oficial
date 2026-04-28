import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cargo } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Cargo[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.cargo) {
      throw new ForbiddenException('Usuário sem permissões suficientes.');
    }

    const hasRole = requiredRoles.includes(user.cargo);
    if (!hasRole) {
      throw new ForbiddenException(`Acesso restrito. Requer um dos seguintes cargos: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
