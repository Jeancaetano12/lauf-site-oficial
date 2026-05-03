import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';
import { SolicitarInscricaoDto } from './dto/solicitar-inscricao.dto';
import { LoginDto } from './dto/login.dto';
import { ConcluirCadastroDto } from './dto/concluir-cadastro.dto';
import { RecuperarSenhaDto } from './dto/recuperar-senha.dto';

// Mock do AuthService
// Como já testamos todas as lógicas no arquivo auth.service.spec.ts,
// aqui no Controller não precisamos testar se as regras funcionam.
// O objetivo é testar se o Controller chamou o Service corretamente!
const mockAuthService = {
  solicitarInscricao: jest.fn().mockResolvedValue({ message: 'Sucesso', id: '123' }),
  aprovarSolicitacao: jest.fn().mockResolvedValue({ message: 'Aprovada' }),
  rejeitarSolicitacao: jest.fn().mockResolvedValue({ message: 'Rejeitada' }),
  login: jest.fn().mockResolvedValue({ accessToken: 'token', refreshToken: 'ref' }),
  concluirCadastro: jest.fn().mockResolvedValue({ message: 'Cadastro concluido' }),
  solicitarRecuperacaoSenha: jest.fn().mockResolvedValue({ message: 'Email enviado' }),
  redefinirSenha: jest.fn().mockResolvedValue({ message: 'Senha redefinida' }),
  logOff: jest.fn().mockResolvedValue({ message: 'Logoff realizado' }),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar o metodo de solicitarInscricao do service', async () => {
    const dto: SolicitarInscricaoDto = { nome: 'Teste', matricula: '12345678', email: 'teste@teste.com', telefone: '85989694059', curso: 'ENGENHARIA_DA_COMPUTACAO', cargoPretendido: 'COORDENADOR' };

    const resultado = await controller.solicitarInscricao(dto);

    // Valida se o Controller chamou o service enviando os parametros corretos
    expect(authService.solicitarInscricao).toHaveBeenCalledWith(dto);
    expect(resultado).toEqual({ message: 'Sucesso', id: '123' });
  });

  it('deve chamar o metodo de aprovarSolicitacao do service', async () => {
    const id = 'ID-Aprovado';

    await controller.aprovarSolicitacao(id);

    expect(authService.aprovarSolicitacao).toHaveBeenCalledWith(id);
  });

  it('deve chamar o metodo de rejeitarSolicitacao do service', async () => {
    const id = 'ID-Rejeitado';

    await controller.rejeitarSolicitacao(id);

    expect(authService.rejeitarSolicitacao).toHaveBeenCalledWith(id);
  });

  it('deve chamar o metodo de login do service', async () => {
    const dto: LoginDto = { matricula: '12345678', senha: '[PASSWORD]' };

    const resultado = await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(resultado).toHaveProperty('accessToken');
  });

  it('deve chamar o metodo de solicitarRecuperacaoSenha do service', async () => {
    const dto: RecuperarSenhaDto = { email: 'teste@teste.com', matricula: '12345678' };

    const resultado = await controller.solicitarRecuperacaoSenha(dto);

    expect(authService.solicitarRecuperacaoSenha).toHaveBeenCalledWith(dto);
    expect(resultado).toEqual({ message: 'Email enviado' });
  });

  it('deve chamar o metodo de redefinirSenha do service', async () => {
    const dto: RedefinirSenhaDto = { tokenRecuperacaoSenha: 'token', novaSenha: 'novaSenha' };

    const resultado = await controller.redefinirSenha(dto);

    expect(authService.redefinirSenha).toHaveBeenCalledWith(dto.tokenRecuperacaoSenha, dto.novaSenha);
    expect(resultado).toEqual({ message: 'Senha redefinida' });
  });

  it('deve chamar o metodo de logoff do service', async () => {
    const usuarioId = 'user-id-123';

    await controller.logoff(usuarioId);

    expect(authService.logOff).toHaveBeenCalledWith(usuarioId);
  });
});
