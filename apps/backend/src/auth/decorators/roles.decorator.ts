import { SetMetadata } from '@nestjs/common';
import { Cargo } from '@prisma/client';

export const CARGOS_KEY = 'cargos';
export const Cargos = (...cargos: Cargo[]) => SetMetadata(CARGOS_KEY, cargos);
