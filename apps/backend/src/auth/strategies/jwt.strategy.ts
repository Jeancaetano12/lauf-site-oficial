import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não está definido nas variaveis de ambiente ou nao foi encontrada.')
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token inválido.');
    }

    // O que retornarmos aqui será injetado no request.user
    return {
      id: payload.sub,
      nome: payload.nome,
      matricula: payload.matricula,
      telefone: payload.telefone,
      cargo: payload.cargo,
      email: payload.email,
      curso: payload.curso
    };
  }
}
