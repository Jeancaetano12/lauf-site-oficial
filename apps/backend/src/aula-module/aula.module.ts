import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AulaController } from './aula.controller';
import { AulaService } from './aula.service';
import { AulaCronService } from './aula-cron.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';


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
    controllers: [AulaController],
    providers: [AulaService, AulaCronService, JwtStrategy],
    exports: [AulaService],
})
export class AulaModule { }
