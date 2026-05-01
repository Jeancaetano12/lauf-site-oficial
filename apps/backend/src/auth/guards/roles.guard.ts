import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cargo } from '@prisma/client';
import { CARGOS_KEY } from '../decorators/roles.decorator';

@Injectable()
export class CargosGuard implements CanActivate {
  private readonly logger = new Logger(CargosGuard.name);

  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const necessarioCargos = this.reflector.getAllAndOverride<Cargo[]>(CARGOS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!necessarioCargos) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.cargo) {
      this.logger.log(`[DEBUG] Usuário ${user.matricula || 'desconhecido'} sem permissões suficientes`);
      throw new ForbiddenException('Usuário sem permissões suficientes.');
    }

    const temCargo = necessarioCargos.includes(user.cargo);
    if (!temCargo) {
      this.logger.log(`[DEBUG] Usuário sem permissões suficientes. Cargo do usuário: ${user.cargo}, cargos necessários: ${necessarioCargos.join(', ')}`);
      throw new ForbiddenException(`Acesso restrito. Requer um dos seguintes cargos: ${necessarioCargos.join(', ')}`);
    }

    this.logger.log(`[DEBUG] Usuário ${user.matricula} com cargo ${user.cargo} tem permissão para acessar o recurso`);
    return true;
  }
}
