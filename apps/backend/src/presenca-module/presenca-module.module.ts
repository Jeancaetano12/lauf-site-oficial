import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PresencaService } from './presenca.service';
import { PresencaController } from './presenca.controller';

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
    controllers: [
        PresencaController
    ],
    providers: [
        PresencaService,
        JwtStrategy
    ],
    exports: [JwtStrategy],
})
export class PresencaModule { }
