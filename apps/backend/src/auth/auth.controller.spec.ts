import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';
import { SolicitarInscricaoDto } from './dto/solicitar-inscricao.dto';
import { LoginDto } from './dto/login.dto';
import { ConcluirCadastroDto } from './dto/concluir-cadastro.dto';
import { RecuperarSenhaDto } from './dto/recuperar-senha.dto';

const mockResponse = () => {
  const res: any = {};
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (cookies: any = {}) => {
  return { cookies } as any;
};

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
  logOut: jest.fn().mockResolvedValue({ message: 'Logout realizado' }),
  validarSessao: jest.fn().mockResolvedValue({ ok: true, usuario: {} }),
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
    const dto: SolicitarInscricaoDto = { nome: 'Teste', matricula: '12345678', email: 'teste@teste.com', telefone: '85989694059', curso: 'ENGENHARIA_DA_COMPUTACAO', cargoPretendido: 'COORDENADOR', genero: 'MASCULINO' as any };

    const resultado = await controller.solicitarInscricao(dto);

    // Valida se o Controller chamou o service enviando os parametros corretos
    expect(authService.solicitarInscricao).toHaveBeenCalledWith(dto);
    expect(resultado).toEqual({ message: 'Sucesso', id: '123' });
  });

  it('deve chamar o metodo de aprovarSolicitacao do service', async () => {
    const id = 'ID-Aprovado';
    const mockUser = { nome: 'Admin', email: 'admin@lauf.com', matricula: '11111111' };

    await controller.aprovarSolicitacao(id, mockUser);

    expect(authService.aprovarSolicitacao).toHaveBeenCalledWith(id, 'Admin (admin@lauf.com - 11111111)');
  });

  it('deve chamar o metodo de rejeitarSolicitacao do service', async () => {
    const id = 'ID-Rejeitado';
    const mockUser = { nome: 'Admin', email: 'admin@lauf.com', matricula: '11111111' };

    await controller.rejeitarSolicitacao(id, mockUser);

    expect(authService.rejeitarSolicitacao).toHaveBeenCalledWith(id, 'Admin (admin@lauf.com - 11111111)');
  });

  it('deve chamar o metodo de login do service', async () => {
    const dto: LoginDto = { matricula: '12345678', senha: '[PASSWORD]' };
    const res = mockResponse();

    const resultado = await controller.login(dto, res);

    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(res.cookie).toHaveBeenCalledTimes(2); // accessToken e refreshToken
    expect(resultado.message).toBe('Login realizado com sucesso');
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

  it('deve chamar o metodo validarSessao do service', async () => {
    const refreshToken = 'meu-refresh-token';
    const req = mockRequest({ refreshToken });

    await controller.validarSessao(req);

    expect(authService.validarSessao).toHaveBeenCalledWith(refreshToken);
  });
});
