import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        // Verificação de segurança, garantindo que o token seja gerado apenas se o JWT_SECRET estiver definido
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET não está definido nas variaveis de ambiente ou nao foi encontrada.')
        }

        return {
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '15m' }, // Token expira em 15min
        }
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule { }