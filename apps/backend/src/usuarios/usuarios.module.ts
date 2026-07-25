import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { SolicitacoesController } from './solicitacoes.controller';
import { SolicitacoesService } from './solicitacoes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        JwtModule.registerAsync({
            useFactory: () => {
                if (!process.env.JWT_SECRET) {
                    throw new Error('JWT_SECRET não está definido nas variaveis de ambiente ou nao foi encontrada.')
                }

                return {
                    secret: process.env.JWT_SECRET,
                    signOptions: { expiresIn: '15m' }, // Token expira em 15min
                }
            },
        })
    ],
    controllers: [UsuariosController, SolicitacoesController],
    providers: [UsuariosService, SolicitacoesService],
    exports: [UsuariosService, SolicitacoesService],
})
export class UsuariosModule { }
