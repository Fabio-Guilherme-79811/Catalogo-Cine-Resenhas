const request = require('supertest');
import app from '../../app';

describe('Auth routes', () => {
  // GET /login sempre renderizou a página diretamente (200) — nunca
  // redirecionou. Este teste esperava um 302 que nunca correspondeu ao
  // comportamento real da rota.
  test('GET/login deve retornar a página de login', async () => {
    const response = await request(app).get('/login');

    expect(response.statusCode).toBe(200);
  });

  // Testa se a página de cadastro é acessada corretamente
  test('GET/cadastro deve retornar a página de cadastro', async () => {
    const response = await request(app).get('/cadastro');

    expect(response.statusCode).toBe(200);
  });

  // Testa se um novo usuário consegue se cadastrar com dados válidos.
  // O cadastro persiste de verdade (via UsuarioRepository) e já
  // autentica o usuário, redirecionando para /catalogo.
  test('POST/registro deve cadastrar usuário e autenticar automaticamente', async () => {
    const response = await request(app)
      .post('/registro')
      .send({
        nome: 'Teste',
        email: `teste-${Date.now()}@email.com`,
        senha: '123456',
        confirmarSenha: '123456',
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/catalogo');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  // Testa se o cadastro falha quando a confirmação de senha não confere
  test('POST/registro deve rejeitar senhas que não conferem', async () => {
    const response = await request(app)
      .post('/registro')
      .send({
        nome: 'Teste',
        email: `teste-${Date.now()}@email.com`,
        senha: '123456',
        confirmarSenha: '654321',
      });

    expect(response.statusCode).toBe(400);
  });

  // Testa o login com credenciais válidas
  test('POST/entrar deve autenticar com credenciais válidas', async () => {
    const email = `login-${Date.now()}@email.com`;

    await request(app)
      .post('/registro')
      .send({ nome: 'Login Teste', email, senha: '123456', confirmarSenha: '123456' });

    const response = await request(app).post('/entrar').send({ email, senha: '123456' });

    expect(response.statusCode).toBe(302);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  // Testa o login com senha incorreta
  test('POST/entrar deve rejeitar senha incorreta', async () => {
    const email = `login-errado-${Date.now()}@email.com`;

    await request(app)
      .post('/registro')
      .send({ nome: 'Login Errado', email, senha: '123456', confirmarSenha: '123456' });

    const response = await request(app).post('/entrar').send({ email, senha: 'senhaErrada' });

    expect(response.statusCode).toBe(401);
  });
});
