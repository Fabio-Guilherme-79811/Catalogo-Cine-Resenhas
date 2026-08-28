import request from 'supertest';
import express from 'express';
import perfilRoutes from '../user-routes';

// Mock do middleware de autenticação
jest.mock('../../middlewares/auth-middleware', () => ({
  isAuthenticated: (req: any, res: any, next: any) => {
    req.user = {
      id: 1,
      nome: 'João',
      role: 'USER',
    };
    next();
  },
}));

const app = express();

app.use(express.json());
app.use('/usuario', perfilRoutes);

describe('Rotas de Usuário', () => {
  describe('GET /usuario/perfil', () => {
    it('deve retornar os dados do usuário autenticado', async () => {
      const response = await request(app).get('/usuario/perfil');

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        id: 1,
        nome: 'João',
        role: 'USER',
      });
    });
  });

  describe('PUT /usuario/perfil', () => {
    it('deve atualizar o perfil', async () => {
      const dados = {
        nome: 'Maria',
        email: 'maria@email.com',
      };

      const response = await request(app).put('/usuario/perfil').send(dados);

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        mensagem: 'Perfil de João atualizado com sucesso.',
        dados,
      });
    });
  });

  describe('PUT /usuario/senha', () => {
    it('deve atualizar a senha', async () => {
      const response = await request(app).put('/usuario/senha').send({
        senhaAtual: '123456',
        novaSenha: '654321',
      });

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        mensagem: 'Senha atualizada com sucesso.',
      });
    });

    it('deve retornar erro quando faltar a senha atual', async () => {
      const response = await request(app).put('/usuario/senha').send({
        novaSenha: '654321',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        mensagem: 'Informe a senha atual e a nova senha.',
      });
    });

    it('deve retornar erro quando faltar a nova senha', async () => {
      const response = await request(app).put('/usuario/senha').send({
        senhaAtual: '123456',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        mensagem: 'Informe a senha atual e a nova senha.',
      });
    });
  });

  describe('DELETE /usuario/conta', () => {
    it('deve remover a conta do usuário', async () => {
      const response = await request(app).delete('/usuario/conta');

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        mensagem: 'Conta de João removida com sucesso.',
      });
    });
  });
});
