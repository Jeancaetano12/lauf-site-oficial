import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) { }

  async enviarEmailConfirmacaoSolicitacao(email: string, nome: string) {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'LAUF - Confirmação de Solicitação de Inscrição',
      html: `
        <h3>Olá, ${nome}!</h3>
        <p>Recebemos sua solicitação de inscrição na Liga de Arduino Uninassau Fortaleza (LAUF).</p>
        <p>Sua solicitação será analisada pela nossa equipe e em breve você receberá um e-mail com o resultado.</p>
        <br />
        <p>Atenciosamente,</p>
        <p>Equipe LAUF</p>
      `,
    }).then(() => {
      this.logger.log(`E-mail de confirmação de solicitação enviado com sucesso para ${email}`);
      return 1;
    }).catch((e) => {
      this.logger.error(`Erro ao enviar e-mail de confirmação de solicitação para ${email}: ${e.message}`, e.stack);
      return 0;
    });
  }

  async enviarEmailAprovacao(email: string, nome: string, token: string) {
    const url = `http://localhost:5173/concluir-cadastro?token=${token}`; // Supondo que o frontend roda na porta 5173 e a rota seja /registro

    return await this.mailerService.sendMail({
      to: email,
      subject: 'Bem-vindo(a) à LAUF - Inscrição Aprovada!',
      html: `
        <h3>Olá, ${nome}!</h3>
        <p>Sua solicitação de inscrição na Liga de Arduino Uninassau Fortaleza (LAUF) foi <strong>aprovada</strong>.</p>
        <p>Para concluir seu cadastro e criar sua senha de acesso ao sistema, clique no link abaixo:</p>
        <p><a href="${url}">Concluir Meu Cadastro</a></p>
        <br />
        <p><strong>ATENÇÃO:</strong> Este link expira em <strong>7 dias.</strong>. Caso não conclua o cadastro nesse prazo, será necessário solicitar a entrada novamente.</p>
        <p>Atenciosamente,</p>
        <p>Equipe LAUF</p>
      `,
    }).then(() => {
      this.logger.log(`E-mail de aprovação enviado com sucesso para ${email}`);
      return 1;
    }).catch((e) => {
      this.logger.error(`Erro ao enviar e-mail de aprovação para ${email}: ${e.message}`, e.stack);
      return 0;
    });
  }

  async enviarEmailRecuperacaoSenha(email: string, token: string) {
    const url = `http://localhost:5173/recuperar-senha?token=${token}`;

    return await this.mailerService.sendMail({
      to: email,
      subject: 'LAUF - Recuperação de Senha',
      html: `
        <p>Você solicitou a recuperação da sua senha no sistema da LAUF.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <p><a href="${url}">Redefinir Minha Senha</a></p>
        <br />
        <p><strong>ATENÇÃO:</strong> Este link expira em <strong>1 hora.</strong>. Caso não conclua a recuperação nesse prazo, será necessário solicitar a recuperação novamente.</p>
        <p>Se você não solicitou a recuperação, ignore este e-mail.</p>
        <p>Atenciosamente,</p>
        <p>Equipe LAUF</p>
      `,
    }).then(() => {
      this.logger.log(`E-mail de recuperação de senha enviado com sucesso para ${email}`);
      return 1;
    }).catch((e) => {
      this.logger.error(`Erro ao enviar e-mail de recuperação de senha para ${email}: ${e.message}`, e.stack);
      return 0;
    });
  }

  async enviarEmailRecuperacaoSenhaSucesso(email: string, nome: string) {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'LAUF - Recuperação de Senha',
      html: `
        <h3>Olá, ${nome}!</h3>
        <p>Sua senha foi redefinida com sucesso no sistema da LAUF.</p>
        <p>Se você não foi você quem redefiniu a senha, entre em contato conosco em:</p>
        <p><a href="https://www.instagram.com/lauf.for/">Instagram da LAUF</a></p>
        <br />      
        <p>Atenciosamente,</p>
        <p>Equipe LAUF</p>
      `,
    }).then(() => {
      this.logger.log(`E-mail de recuperação de senha enviado com sucesso para ${email}`);
      return 1;
    }).catch((e) => {
      this.logger.error(`Erro ao enviar e-mail de recuperação de senha para ${email}: ${e.message}`, e.stack);
      return 0;
    });
  }

  async enviarEmailRejeicao(email: string, nome: string) {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'LAUF - Solicitação de Inscrição Rejeitada',
      html: `
        <h3>Olá, ${nome}!</h3>
        <p>Infelizmente sua solicitação de inscrição na Liga de Arduino Uninassau Fortaleza (LAUF) foi <strong>rejeitada</strong>.</p>
        <br />
        <p>Se você acredita que houve um engano? Você pode solicitar a inscrição novamente, caso precise de mais ajuda, entre em contato conosco em:</p>
        <p><a href="https://www.instagram.com/lauf.for/">Instagram da LAUF</a></p>
        <p>Atenciosamente,</p>
        <p>Equipe LAUF</p>
      `,
    }).then(() => {
      this.logger.log(`E-mail de rejeição enviado com sucesso para ${email}`);
      return 1;
    }).catch((e) => {
      this.logger.error(`Erro ao enviar e-mail de rejeição para ${email}: ${e.message}`, e.stack);
      return 0;
    });
  }

  async enviarEmailLogin(email: string, nome: string) {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'LAUF - Login',
      html: `
        <h3>Olá, ${nome}!</h3>
        <p>Você logou no sistema da LAUF.</p>
        <p>Se você não foi você quem logou, redefina sua senha clicando <a href="ROTAS DO FRONTEND">>:</p>
        <br />      
        <p>Atenciosamente,</p>
        <p>Equipe LAUF</p>
      `,
    }).then(() => {
      this.logger.log(`E-mail de login enviado com sucesso para ${email}`);
      return 1;
    }).catch((e) => {
      this.logger.error(`Erro ao enviar e-mail de login para ${email}: ${e.message}`, e.stack);
      return 0;
    });
  }
}
