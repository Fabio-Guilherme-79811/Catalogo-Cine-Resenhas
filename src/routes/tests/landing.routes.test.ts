import request from 'supertest';
import app from '../../app'; // ajuste este caminho conforme a localização real do seu app Express

/**
 * Testes de integração para as rotas da landing page (`landing-routes.ts`),
 * montadas na raiz (`/`) da aplicação principal.
 */
describe('Landing routes', () => {
  describe('GET /', () => {
    // Testa se a landing page é renderizada com sucesso
    test('deve retornar 200 e renderizar a página inicial', async () => {
      const response = await request(app).get('/');

      expect(response.statusCode).toBe(200);
    });

    // Testa se os labels dos CTAs de login e cadastro aparecem no HTML renderizado
    test('deve exibir os labels dos CTAs de login e cadastro', async () => {
      const response = await request(app).get('/');

      expect(response.text).toContain('Entrar');
      expect(response.text).toContain('Cadastrar');
    });
  });
});
