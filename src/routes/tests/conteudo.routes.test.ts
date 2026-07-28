import request from 'supertest';
import express from 'express';
import conteudoRoutes, { filmes } from '../conteudo-routes';

// Mock dos middlewares
jest.mock('../../middlewares/auth-middleware', () => ({
  isAuthenticated: (req: any, _res: any, next: any) => {
    req.user = {
      id: '1',
      nome: 'Administrador',
      role: 'admin',
    };
    next();
  },
  isAdmin: (_req: any, _res: any, next: any) => next(),
}));

const app = express();
app.use(express.json());
app.use('/', conteudoRoutes);
 // Recarrega os filmes antes de cada teste para evitar que um teste afete o outro
describe('Conteudo Routes', () => {

  beforeEach(() => {
    filmes.length = 0;

    filmes.push(
      {
        id: '1',
        titulo: 'Filme Teste',
        sinopse: 'Sinopse',
        genero: 'Drama',
        anoLancamento: 2024,
        publicado: true,
      },
      {
        id: '2',
        titulo: 'Filme Privado',
        sinopse: 'Sinopse',
        genero: 'Ação',
        anoLancamento: 2023,
        publicado: false,
      }
    );
  });
    // Verifica se a API retorna apenas filmes publicados
  test('GET /filmes deve listar somente filmes publicados', async () => {
    const res = await request(app).get('/filmes');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].titulo).toBe('Filme Teste');
  });
  // Verifica se a busca por gênero funciona corretamente
  test('GET /filmes?genero=Drama deve filtrar por gênero', async () => {
    const res = await request(app).get('/filmes?genero=Drama');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].genero).toBe('Drama');
  });
  // Verifica se é possível buscar um filme pelo ID
  test('GET /filmes/:id deve retornar um filme existente', async () => {
    const res = await request(app).get('/filmes/1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('1');
  });
  // Verifica o comportamento quando o ID informado não existe
  test('GET /filmes/:id deve retornar 404 para filme inexistente', async () => {
    const res = await request(app).get('/filmes/999');

    expect(res.status).toBe(404);
  });

  test('POST /filmes deve criar um novo filme', async () => {
    const res = await request(app)
      .post('/filmes')
      .send({
        titulo: 'Novo Filme',
        sinopse: 'Teste',
        genero: 'Comédia',
        anoLancamento: 2025,
      });

    expect(res.status).toBe(201);
    expect(res.body.titulo).toBe('Novo Filme');
    expect(filmes).toHaveLength(3);
  });

  test('POST /filmes deve retornar 400 quando faltar campos obrigatórios', async () => {
    const res = await request(app)
      .post('/filmes')
      .send({
        titulo: 'Novo Filme',
      });

    expect(res.status).toBe(400);
  });
  
  test('PUT /filmes/:id deve atualizar um filme', async () => {
    const res = await request(app)
      .put('/filmes/1')
      .send({
        titulo: 'Título Atualizado',
      });

    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('Título Atualizado');
  });

  test('PUT /filmes/:id deve retornar 404 quando filme não existir', async () => {
    const res = await request(app)
      .put('/filmes/999')
      .send({
        titulo: 'Teste',
      });

    expect(res.status).toBe(404);
  });

  test('DELETE /filmes/:id deve remover um filme', async () => {
    const res = await request(app).delete('/filmes/1');

    expect(res.status).toBe(200);
    expect(filmes).toHaveLength(1);
  });

  test('DELETE /filmes/:id deve retornar 404 quando filme não existir', async () => {
    const res = await request(app).delete('/filmes/999');

    expect(res.status).toBe(404);
  });

});