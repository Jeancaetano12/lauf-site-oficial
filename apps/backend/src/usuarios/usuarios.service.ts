import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsuariosService {
    private readonly logger = new Logger(UsuariosService.name)
    constructor(private readonly prisma: PrismaService) { }


}