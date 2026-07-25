import { Controller, Logger } from "@nestjs/common";
import { UsuariosService } from "./usuarios.service";

@Controller('usuarios')
export class UsuariosController {
    private readonly logger = new Logger(UsuariosController.name)
    constructor(private readonly usuariosService: UsuariosService) { }
}
