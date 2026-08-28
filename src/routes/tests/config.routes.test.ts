import request from 'supertest';
import express from 'express';
import configRoutes from '../config-routes';

// Mock dos middlewares
jest.mock('../../middlewares/auth-middleware', () => ({
  isAuthenticated: (req: any, res: any, next: any) => {
    req.user = {
      id: 1,
      nome: 'Administrador',
      role: 'ADMIN',
    };
    next();
  },

  isAdmin: (req: any, res: any, next: any) => {
    next();
  },
}));

const app = express();

app.use(express.json());
app.use('/config', configRoutes);

describe('Config Routes', () => {
  describe('GET /config', () => {
    it('deve retornar as configurações públicas', async () => {
      const response = await request(app).get('/config');

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        nomeSite: 'Cine-resenhas',
        descricao: 'Sua resenha é a nossa também!',
        corPrimaria: '#e54646',
        modoManutencao: false,
      });
    });
  });

  describe('GET /config/completo', () => {
    it('deve retornar toda a configuração', async () => {
      const response = await request(app).get('/config/completo');

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        nomeSite: 'Cine-resenhas',
        descricao: 'Sua resenha é a nossa também!',
        corPrimaria: '#e54646',
        modoManutencao: false,
        emailSuporte: 'suporte@exemplo.com',
      });
    });
  });

  describe('PUT /config', () => {
    it('deve atualizar a configuração', async () => {
      const response = await request(app).put('/config').send({
        nomeSite: 'Novo Cine',
      });

      expect(response.status).toBe(200);

      expect(response.body.mensagem).toBe('Configurações atualizadas com sucesso.');

      expect(response.body.config.nomeSite).toBe('Novo Cine');
    });
  });

  describe('PUT /config/manutencao', () => {
    it('deve ativar o modo de manutenção', async () => {
      const response = await request(app).put('/config/manutencao').send({
        ativo: true,
      });

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        mensagem: 'Modo de manutenção ativado.',
      });
    });

    it('deve desativar o modo de manutenção', async () => {
      const response = await request(app).put('/config/manutencao').send({
        ativo: false,
      });

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        mensagem: 'Modo de manutenção desativado.',
      });
    });

    it('deve retornar erro quando "ativo" não for boolean', async () => {
      const response = await request(app).put('/config/manutencao').send({
        ativo: 'sim',
      });

      expect(response.status).toBe(400);

      expect(response.body).toEqual({
        mensagem: 'Informe o campo "ativo" como true ou false.',
      });
    });
  });
});
