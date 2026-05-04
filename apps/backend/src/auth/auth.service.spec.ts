import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Curso } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { SolicitarInscricaoDto } from './dto/solicitar-inscricao.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Criamos um Mock (imitação) do Prisma para não tocar no banco real
const mockPrismaService = {
  solicitacaoInscricao: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  usuario: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  sessao: {
    deleteMany: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

// Criamos um Mock do JwtService
const mockJwtService = {
  sign: jest.fn().mockReturnValue('meu-token-jwt-falso'),
};

// Criamos um Mock do MailService
const mockMailService = {
  enviarEmailConfirmacaoSolicitacao: jest.fn().mockResolvedValue({}),
  enviarEmailAprovacao: jest.fn().mockResolvedValue({}),
  enviarEmailRecuperacaoSenha: jest.fn().mockResolvedValue({}),
  enviarEmailRecuperacaoSenhaSucesso: jest.fn().mockResolvedValue({}),
  enviarEmailRejeicao: jest.fn().mockResolvedValue({}),
  enviarEmailLogin: jest.fn().mockResolvedValue({}),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpa o estado entre cada teste
  });

  describe('solicitarInscricao', () => {
    it('deve criar uma nova solicitacao se nao existir nenhuma pendente ou aprovada', async () => {
      // Configuração: Simular que findFirst retornou vazio (não existe)
      mockPrismaService.solicitacaoInscricao.findFirst.mockResolvedValue(null);
      // Simular retorno da criação
      mockPrismaService.solicitacaoInscricao.create.mockResolvedValue({ id: 'id-solicitacao' });

      const dto: SolicitarInscricaoDto = {
        nome: 'João', email: 'joao@teste.com', matricula: '01548379', telefone: '85989694059', curso: Curso.ENGENHARIA_DA_COMPUTACAO, cargoPretendido: 'ALUNO' as any
      };

      const resultado = await service.solicitarInscricao(dto);

      expect(mockPrismaService.solicitacaoInscricao.findFirst).toHaveBeenCalled();
      expect(mockPrismaService.solicitacaoInscricao.create).toHaveBeenCalled();
      expect(mockMailService.enviarEmailConfirmacaoSolicitacao).toHaveBeenCalled();
      expect(resultado.message).toBe('Solicitação criada com sucesso.');
      expect(resultado.id).toBe('id-solicitacao');
    });

    it('deve rejeitar se ja existir uma solicitacao PENDENTE', async () => {
      mockPrismaService.solicitacaoInscricao.findFirst.mockResolvedValue({ status: 'PENDENTE' });

      const dto: SolicitarInscricaoDto = { nome: 'João', email: 'joao@teste.com', matricula: '01548379', telefone: '85989694059', curso: Curso.ENGENHARIA_DA_COMPUTACAO, cargoPretendido: 'ALUNO' as any };

      await expect(service.solicitarInscricao(dto)).rejects.toThrow(BadRequestException);
    });

    it('deve rejeitar se ja existir uma solicitacao APROVADA', async () => {
      mockPrismaService.solicitacaoInscricao.findFirst.mockResolvedValue({ status: 'APROVADA' });

      const dto: SolicitarInscricaoDto = { nome: 'João', email: 'joao@teste.com', matricula: '01548379', telefone: '85989694059', curso: Curso.ENGENHARIA_DA_COMPUTACAO, cargoPretendido: 'ALUNO' as any };

      await expect(service.solicitarInscricao(dto)).rejects.toThrow(BadRequestException);
    });

    it('deve criar uma nova solicitacao se ja existir uma solicitacao REJEITADA', async () => {
      mockPrismaService.solicitacaoInscricao.findFirst.mockResolvedValue({ status: 'REJEITADA' });
      mockPrismaService.solicitacaoInscricao.create.mockResolvedValue({ id: 'id-solicitacao' });

      const dto: SolicitarInscricaoDto = { nome: 'João', email: 'joao@teste.com', matricula: '01548379', telefone: '85989694059', curso: Curso.ENGENHARIA_DA_COMPUTACAO, cargoPretendido: 'ALUNO' as any };

      const resultado = await service.solicitarInscricao(dto);

      expect(mockPrismaService.solicitacaoInscricao.create).toHaveBeenCalled();
      expect(mockMailService.enviarEmailConfirmacaoSolicitacao).toHaveBeenCalled();
      expect(resultado.message).toBe('Solicitação enviada novamente.');
      expect(resultado.id).toBe('id-solicitacao');
    })
  });

  describe('aprovarSolicitacao', () => {
    it('deve aprovar a solicitacao e gerar o tokenRegistro', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({ id: 'id-1', status: 'PENDENTE' });
      mockPrismaService.solicitacaoInscricao.update.mockResolvedValue({ status: 'APROVADA' });

      const resultado = await service.aprovarSolicitacao('id-1');

      expect(mockPrismaService.solicitacaoInscricao.update).toHaveBeenCalled();
      expect(mockMailService.enviarEmailAprovacao).toHaveBeenCalled();
      expect(resultado.message).toBe('Solicitação aprovada.');
      expect(resultado.tokenGerado).toBeDefined(); // Garante que o token hex foi criado
    });

    it('deve rejeitar se a solicitacao nao existir', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue(null);

      await expect(service.aprovarSolicitacao('id-nao-existe')).rejects.toThrow(NotFoundException);
    });

    it('deve rejeitar se a solicitacao ja estiver aprovada', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({ id: 'id-1', status: 'APROVADA' });

      await expect(service.aprovarSolicitacao('id-1')).rejects.toThrow(BadRequestException);
    });

    it('deve rejeitar se a solicitacao ja estiver rejeitada', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({ id: 'id-1', status: 'REJEITADA' });

      await expect(service.aprovarSolicitacao('id-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('concluirCadastro', () => {
    it('deve criar o usuario, hashear a senha e limpar a solicitacao', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 1); // 1 dia no futuro (não expirou)

      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({
        id: 'id-1', tokenRegistro: 'meu-token', tokenRegistroExpiraEm: dataFutura,
        nome: 'João', email: 'joao@t.com', matricula: '01548379', curso: Curso.ENGENHARIA_DA_COMPUTACAO, cargoPretendido: 'ALUNO'
      });

      // Espionar e forçar o bcrypt a retornar uma hash simulada
      (bcrypt.hash as jest.Mock).mockResolvedValue('minhasenha_hasheada');
      mockPrismaService.usuario.create.mockResolvedValue({ id: 'user-id', senha: 'minhasenha_hasheada' });
      mockPrismaService.solicitacaoInscricao.update.mockResolvedValue({ status: 'APROVADA' });

      const resultado = await service.concluirCadastro({ tokenRegistro: 'meu-token', senha: '01548379' });

      expect(mockPrismaService.usuario.create).toHaveBeenCalled();
      expect(mockPrismaService.solicitacaoInscricao.update).toHaveBeenCalled();
      expect(resultado.message).toBe('Cadastro concluído com sucesso.');
    });

    it('deve rejeitar se o token ja tiver expirado', async () => {
      const dataPassada = new Date();
      dataPassada.setDate(dataPassada.getDate() - 1); // 1 dia no passado (expirou)

      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({
        id: 'id-1', tokenRegistro: 'meu-token', tokenRegistroExpiraEm: dataPassada,
        nome: 'João', email: 'joao@t.com', matricula: '01548379', curso: Curso.ENGENHARIA_DA_COMPUTACAO, cargoPretendido: 'ALUNO'
      });

      await expect(service.concluirCadastro({ tokenRegistro: 'meu-token', senha: '01548379' })).rejects.toThrow(BadRequestException);
    });

    it('deve rejeitar se o token nao existir', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue(null);

      await expect(service.concluirCadastro({ tokenRegistro: 'token-inexistente', senha: '01548379' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('login', () => {
    it('deve retornar accessToken e refreshToken para credenciais validas', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'user-id', matricula: '01548379', senha: 'hash', cargo: 'ALUNO', email: 'j@t.com'
      });
      // Simular senha correta
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      // Simular criacao de sessao
      mockPrismaService.sessao.create.mockResolvedValue({});

      const resultado = await service.login({ matricula: '01548379', senha: '01548379' });

      expect(resultado.accessToken).toBe('meu-token-jwt-falso');
      expect(mockMailService.enviarEmailLogin).toHaveBeenCalled();
      expect(resultado.refreshToken).toBeDefined();
    });

    it('deve lançar erro se a senha estiver errada', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({ id: 'user-id', matricula: '01548379', senha: 'hash' });
      // Simular senha errada
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ matricula: '01548379', senha: '123' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('solicitarRecuperacaoSenha', () => {
    it('deve gerar o token de recuperacao e retornar mensagem de sucesso quando usuario existir', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'joao@teste.com',
        matricula: '01548379',
      });
      mockPrismaService.usuario.update = jest.fn().mockResolvedValue({});

      const resultado = await service.solicitarRecuperacaoSenha({ email: 'joao@teste.com', matricula: '01548379' });

      expect(mockPrismaService.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: 'joao@teste.com', matricula: '01548379' },
      });
      expect(mockPrismaService.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-id' },
          data: expect.objectContaining({
            tokenRecuperacaoSenha: expect.any(String),
            tokenRecuperacaoExpiraEm: expect.any(Date),
          }),
        }),
      );
      expect(mockMailService.enviarEmailRecuperacaoSenha).toHaveBeenCalled();
      expect(resultado.message).toBe('Se o e-mail existir, um link de recuperação foi enviado.');
      expect(resultado.tokenGerado).toBeDefined();
    });

    it('deve retornar mensagem de sucesso mesmo quando usuario nao existir (seguranca)', async () => {
      // O service não revela se o e-mail existe ou não — comportamento esperado por segurança
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      const resultado = await service.solicitarRecuperacaoSenha({ email: 'naoexiste@teste.com', matricula: '00000000' });

      expect(mockPrismaService.usuario.findUnique).toHaveBeenCalled();
      expect(resultado.message).toBe('Se o e-mail existir, um link de recuperação foi enviado.');
      // Não deve ter tokenGerado quando usuário não existe
      expect(resultado.tokenGerado).toBeUndefined();
    });

    it('deve gerar um token com expiracao de 1 hora', async () => {
      const agora = new Date();

      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'joao@teste.com',
        matricula: '01548379',
      });
      mockPrismaService.usuario.update = jest.fn().mockResolvedValue({});

      await service.solicitarRecuperacaoSenha({ email: 'joao@teste.com', matricula: '01548379' });

      const chamada = mockPrismaService.usuario.update.mock.calls[0][0];
      const expiracao: Date = chamada.data.tokenRecuperacaoExpiraEm;

      // A expiração deve ser aproximadamente 1 hora no futuro (margem de 5 segundos)
      const diferencaMs = expiracao.getTime() - agora.getTime();
      expect(diferencaMs).toBeGreaterThan(59 * 60 * 1000);
      expect(diferencaMs).toBeLessThanOrEqual(61 * 60 * 1000);
    });

  });

  describe('redefinirSenha', () => {
    it('deve redefinir a senha, revogar sessoes e limpar o token com sucesso', async () => {
      const dataFutura = new Date();
      dataFutura.setHours(dataFutura.getHours() + 1);

      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'user-id',
        tokenRecuperacaoSenha: 'token-valido',
        tokenRecuperacaoExpiraEm: dataFutura,
      });
      mockPrismaService.sessao.deleteMany = jest.fn().mockResolvedValue({});
      mockPrismaService.usuario.update = jest.fn().mockResolvedValue({});
      (bcrypt.hash as jest.Mock).mockResolvedValue('nova-senha-hasheada');

      const resultado = await service.redefinirSenha('token-valido', 'novaSenha123');

      // Deve ter buscado o usuário pelo token
      expect(mockPrismaService.usuario.findUnique).toHaveBeenCalledWith({
        where: { tokenRecuperacaoSenha: 'token-valido' },
      });
      // Deve ter revogado todas as sessões
      expect(mockPrismaService.sessao.deleteMany).toHaveBeenCalledWith({
        where: { usuarioId: 'user-id' },
      });
      // Deve ter atualizado a senha e limpado o token
      expect(mockPrismaService.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-id' },
          data: expect.objectContaining({
            senha: 'nova-senha-hasheada',
            tokenRecuperacaoSenha: null,
            tokenRecuperacaoExpiraEm: null,
          }),
        }),
      )
      expect(mockMailService.enviarEmailRecuperacaoSenhaSucesso).toHaveBeenCalled();
      expect(resultado.message).toBe('Senha redefinida com sucesso. Faça login novamente.');
    });

    it('deve rejeitar se o token nao existir no banco', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.redefinirSenha('token-inexistente', 'novaSenha123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve rejeitar se o token estiver expirado e limpá-lo do banco', async () => {
      const dataPassada = new Date();
      dataPassada.setHours(dataPassada.getHours() - 1); // 1 hora no passado

      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'user-id',
        tokenRecuperacaoSenha: 'token-expirado',
        tokenRecuperacaoExpiraEm: dataPassada,
      });
      mockPrismaService.usuario.update = jest.fn().mockResolvedValue({});

      await expect(
        service.redefinirSenha('token-expirado', 'novaSenha123'),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-id' },
          data: expect.objectContaining({
            tokenRecuperacaoSenha: null,
            tokenRecuperacaoExpiraEm: null,
          }),
        }),
      );
    });

    it('deve hashear a nova senha antes de salvar', async () => {
      const dataFutura = new Date();
      dataFutura.setHours(dataFutura.getHours() + 1);

      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'user-id',
        tokenRecuperacaoSenha: 'token-valido',
        tokenRecuperacaoExpiraEm: dataFutura,
      });
      mockPrismaService.sessao.deleteMany = jest.fn().mockResolvedValue({});
      mockPrismaService.usuario.update = jest.fn().mockResolvedValue({});
      (bcrypt.hash as jest.Mock).mockResolvedValue('senha-hasheada');

      await service.redefinirSenha('token-valido', 'novaSenha123');

      // Garante que bcrypt.hash foi chamado com a nova senha em texto puro
      expect(bcrypt.hash).toHaveBeenCalledWith('novaSenha123', 10);
      // Garante que a senha salva é o hash, nunca o texto puro
      const dadosSalvos = mockPrismaService.usuario.update.mock.calls[0][0].data;
      expect(dadosSalvos.senha).toBe('senha-hasheada');
      expect(dadosSalvos.senha).not.toBe('novaSenha123');
    });
  });

  describe('logOff', () => {
    it('deve deslogar o usuario com sucesso', async () => {
      mockPrismaService.sessao.deleteMany = jest.fn().mockResolvedValue({ count: 1 });
      const resultado = await service.logOff('user-id');
      expect(mockPrismaService.sessao.deleteMany).toHaveBeenCalledWith({
        where: { usuarioId: 'user-id' },
      });
      expect(resultado.message).toBe('LogOff realizado com sucesso');
    });

    it('deve retornar mensagem de erro quando usuario nao tem sessoes ativas', async () => {
      mockPrismaService.sessao.deleteMany = jest.fn().mockResolvedValue({ count: 0 });
      const resultado = await service.logOff('user-id');
      expect(mockPrismaService.sessao.deleteMany).toHaveBeenCalledWith({
        where: { usuarioId: 'user-id' },
      });
      expect(resultado.message).toBe('Usuario nao tem sessoes ativas');
    });
  });

  describe('refreshToken', () => {
    it('deve rotacionar o refresh token com sucesso', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 7);

      const sessaoMock = {
        id: 'sessao-antiga-id',
        refreshToken: 'token-valido',
        expiraEm: dataFutura,
        valido: true,
        usuario: {
          id: 'user-id',
          matricula: '01548379',
          cargo: 'ALUNO',
          email: 'j@t.com',
          nome: 'João',
          telefone: '85989694059',
        },
      };

      mockPrismaService.sessao.findFirst.mockResolvedValue(sessaoMock);
      mockPrismaService.sessao.delete.mockResolvedValue({});
      mockPrismaService.sessao.create.mockResolvedValue({});

      const resultado = await service.refreshToken('token-valido');

      expect(mockPrismaService.sessao.findFirst).toHaveBeenCalledWith({
        where: { refreshToken: 'token-valido', valido: true },
        include: { usuario: true },
      });
      // Verifica se rotacionou (deletou a antiga)
      expect(mockPrismaService.sessao.delete).toHaveBeenCalledWith({
        where: { id: 'sessao-antiga-id' },
      });
      // Verifica se gerou novos tokens (chamando gerarTokensESessao internamente)
      expect(resultado.accessToken).toBeDefined();
      expect(resultado.refreshToken).toBeDefined();
      expect(resultado.refreshToken).not.toBe('token-valido');
    });

    it('deve lançar erro se o refresh token não existir ou for inválido', async () => {
      mockPrismaService.sessao.findFirst.mockResolvedValue(null);

      await expect(service.refreshToken('token-invalido')).rejects.toThrow(UnauthorizedException);
    });

    it('deve invalidar a sessão e lançar erro se o refresh token estiver expirado', async () => {
      const dataPassada = new Date();
      dataPassada.setDate(dataPassada.getDate() - 1);

      mockPrismaService.sessao.findFirst.mockResolvedValue({
        id: 'sessao-expirada-id',
        expiraEm: dataPassada,
        valido: true,
      });
      mockPrismaService.sessao.update.mockResolvedValue({});

      await expect(service.refreshToken('token-expirado')).rejects.toThrow(UnauthorizedException);
      
      expect(mockPrismaService.sessao.update).toHaveBeenCalledWith({
        where: { id: 'sessao-expirada-id' },
        data: { valido: false },
      });
    });
  });
});
