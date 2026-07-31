import express, { Express } from 'express';
import request from 'supertest';

// Mock do módulo de conteúdo (filmes) para controlar os dados usados nos testes,
// sem depender da implementação real de conteudo-routes.
jest.mock('../conteudo-routes', () => ({
  filmes: [
    { id: '1', publicado: true, titulo: 'Filme Publicado' },
    { id: '2', publicado: false, titulo: 'Filme Não Publicado' },
  ],
}));

// Mock do middleware de autenticação: permite simular diferentes usuários
// enviando o header "x-mock-user" com um JSON (ex: { id, nome, role }).
// Se nenhum header for enviado, assume um usuário comum padrão.
// IMPORTANTE: o caminho aqui precisa resolver para o MESMO arquivo físico
// que o router importa. Ajuste '../../middlewares/auth-middleware' se a
// estrutura de pastas do seu projeto for diferente.
jest.mock('../../middlewares/auth-middleware', () => ({
  isAuthenticated: (req: any, _res: any, next: any) => {
    req.user = req.headers['x-mock-user']
      ? JSON.parse(req.headers['x-mock-user'] as string)
      : { id: 'user1', nome: 'Usuário Teste', role: 'user' };
    next();
  },
  isAdmin: (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ mensagem: 'Acesso restrito a administradores.' });
      return;
    }
    next();
  },
}));

// Importa o router só depois dos mocks acima, para que ele use as versões mockadas
import avaliacoesRouter from '../avaliacao-routes';

// Helper que monta uma instância nova do app Express para cada teste
/**
 * Monta uma nova instância do app Express, com o parser de JSON e o
 * router de avaliações montado em `/avaliacoes`, para uso isolado em cada teste.
 *
 * @returns Uma instância de `Express` pronta para receber requisições via `supertest`.
 */
function makeApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/avaliacoes', avaliacoesRouter);
  return app;
}

// Header pronto para simular um usuário administrador
const adminHeader = { 'x-mock-user': JSON.stringify({ id: 'admin1', nome: 'Admin', role: 'admin' }) };
// Header pronto para simular um segundo usuário comum, diferente do padrão
const outroUsuarioHeader = { 'x-mock-user': JSON.stringify({ id: 'user2', nome: 'Outro Usuário', role: 'user' }) };

describe('Rotas de Avaliações', () => {
  let app: Express;

  beforeEach(() => {
    // Como o "banco" de avaliações é um array em memória dentro do módulo,
    // recriamos o app a cada teste, mas o estado das avaliações persiste
    // entre testes dentro do mesmo arquivo — por isso cada bloco que precisa
    // criar avaliações usa um autor único (evita colidir com a regra de
    // "usuário já avaliou esse filme").
    app = makeApp();
  });

  describe('GET /avaliacoes/filme/:filmeId', () => {
    it('retorna 404 quando o filme não existe', async () => {
      const res = await request(app).get('/avaliacoes/filme/999');
      expect(res.status).toBe(404);
      expect(res.body.mensagem).toMatch(/não encontrado/i);
    });

    it('retorna lista vazia quando o filme existe mas não tem avaliações', async () => {
      const res = await request(app).get('/avaliacoes/filme/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /avaliacoes/filme/:filmeId/media', () => {
    it('retorna média 0 e total 0 quando não há avaliações', async () => {
      const res = await request(app).get('/avaliacoes/filme/1/media');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ media: 0, total: 0 });
    });
  });

  describe('POST /avaliacoes/filme/:filmeId', () => {
    it('retorna 404 ao tentar avaliar um filme inexistente', async () => {
      const res = await request(app)
        .post('/avaliacoes/filme/999')
        .send({ nota: 5, comentario: 'Ótimo!' });
      expect(res.status).toBe(404);
    });

    it('retorna 404 ao tentar avaliar um filme não publicado', async () => {
      const res = await request(app)
        .post('/avaliacoes/filme/2')
        .send({ nota: 5, comentario: 'Ótimo!' });
      expect(res.status).toBe(404);
    });

    it('retorna 400 quando a nota está fora do intervalo permitido (1 a 5)', async () => {
      const res = await request(app)
        .post('/avaliacoes/filme/1')
        .send({ nota: 6, comentario: 'Bom' });
      expect(res.status).toBe(400);
      expect(res.body.mensagem).toMatch(/nota entre 1 e 5/i);
    });

    it('retorna 400 quando o comentário está vazio ou só com espaços', async () => {
      const res = await request(app)
        .post('/avaliacoes/filme/1')
        .send({ nota: 4, comentario: '   ' });
      expect(res.status).toBe(400);
      expect(res.body.mensagem).toMatch(/comentário/i);
    });

    it('cria a avaliação com sucesso e retorna 201 com os dados corretos', async () => {
      // Usuário único, só para não colidir com o teste de duplicidade abaixo
      const header = { 'x-mock-user': JSON.stringify({ id: `post-ok-${Date.now()}`, nome: 'Usuário Teste', role: 'user' }) };

      const res = await request(app)
        .post('/avaliacoes/filme/1')
        .set(header)
        .send({ nota: 5, comentario: 'Excelente filme!' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        filmeId: '1',
        nota: 5,
        comentario: 'Excelente filme!',
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.criadoEm).toBeDefined();
    });

    it('retorna 409 ao tentar avaliar o mesmo filme duas vezes com o mesmo usuário', async () => {
      const header = { 'x-mock-user': JSON.stringify({ id: `post-duplicado-${Date.now()}`, nome: 'Usuário Teste', role: 'user' }) };

      // Primeira avaliação (deve ter sucesso)
      await request(app)
        .post('/avaliacoes/filme/1')
        .set(header)
        .send({ nota: 4, comentario: 'Muito bom' });

      // Segunda tentativa do mesmo usuário no mesmo filme (deve falhar)
      const res = await request(app)
        .post('/avaliacoes/filme/1')
        .set(header)
        .send({ nota: 3, comentario: 'Mudei de ideia' });

      expect(res.status).toBe(409);
    });
  });

  describe('PUT /avaliacoes/:id (fluxo com avaliação já criada)', () => {
    let avaliacaoId: string;
    let autorHeader: { [key: string]: string };

    beforeEach(async () => {
      // Gera um autor único a cada teste para nunca colidir com a regra
      // de "usuário já avaliou esse filme" (409), que persiste no array em memória.
      const autorId = `autor-${Date.now()}-${Math.random()}`;
      autorHeader = {
        'x-mock-user': JSON.stringify({ id: autorId, nome: 'Autor Teste', role: 'user' }),
      };

      const criar = await request(app)
        .post('/avaliacoes/filme/1')
        .set(autorHeader)
        .send({ nota: 3, comentario: 'Comentário inicial' });
      avaliacaoId = criar.body.id;
    });

    it('retorna 404 ao editar uma avaliação inexistente', async () => {
      const res = await request(app).put('/avaliacoes/id-inexistente').send({ nota: 5 });
      expect(res.status).toBe(404);
    });

    it('retorna 403 quando outro usuário (que não é autor nem admin) tenta editar', async () => {
      const res = await request(app)
        .put(`/avaliacoes/${avaliacaoId}`)
        .set(outroUsuarioHeader)
        .send({ nota: 5 });
      expect(res.status).toBe(403);
    });

    it('permite que o próprio autor edite dentro da janela de edição', async () => {
      const res = await request(app)
        .put(`/avaliacoes/${avaliacaoId}`)
        .set(autorHeader)
        .send({ nota: 5, comentario: 'Comentário atualizado' });

      expect(res.status).toBe(200);
      expect(res.body.nota).toBe(5);
      expect(res.body.comentario).toBe('Comentário atualizado');
    });

    it('retorna 400 ao tentar atualizar com nota fora do intervalo permitido', async () => {
      const res = await request(app)
        .put(`/avaliacoes/${avaliacaoId}`)
        .set(autorHeader)
        .send({ nota: 10 });
      expect(res.status).toBe(400);
    });

    it('permite que um admin edite mesmo sem ser o autor', async () => {
      const res = await request(app)
        .put(`/avaliacoes/${avaliacaoId}`)
        .set(adminHeader)
        .send({ nota: 1, comentario: 'Editado pelo admin' });

      expect(res.status).toBe(200);
      expect(res.body.nota).toBe(1);
    });

    it('bloqueia edição pelo autor após a janela de 24h expirar', async () => {
      jest.useFakeTimers();
      // Avança o relógio em 25 horas para simular que o prazo de edição passou
      jest.setSystemTime(Date.now() + 25 * 60 * 60 * 1000);

      const res = await request(app)
        .put(`/avaliacoes/${avaliacaoId}`)
        .set(autorHeader)
        .send({ nota: 2 });

      expect(res.status).toBe(403);
      expect(res.body.mensagem).toMatch(/prazo/i);

      jest.useRealTimers();
    });
  });

  describe('DELETE /avaliacoes/:id', () => {
    let avaliacaoId: string;

    beforeEach(async () => {
      // Autor único aqui também, pelo mesmo motivo do bloco PUT acima.
      const autorId = `autor-delete-${Date.now()}-${Math.random()}`;
      const criar = await request(app)
        .post('/avaliacoes/filme/1')
        .set({ 'x-mock-user': JSON.stringify({ id: autorId, nome: 'Autor Teste', role: 'user' }) })
        .send({ nota: 4, comentario: 'Para testar exclusão' });
      avaliacaoId = criar.body.id;
    });

    it('retorna 403 quando um usuário não-admin tenta excluir', async () => {
      const res = await request(app).delete(`/avaliacoes/${avaliacaoId}`);
      expect(res.status).toBe(403);
    });

    it('retorna 404 ao tentar excluir uma avaliação inexistente (como admin)', async () => {
      const res = await request(app)
        .delete('/avaliacoes/id-inexistente')
        .set(adminHeader);
      expect(res.status).toBe(404);
    });

    it('permite que um admin exclua a avaliação com sucesso', async () => {
      const res = await request(app)
        .delete(`/avaliacoes/${avaliacaoId}`)
        .set(adminHeader);

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toMatch(/removida/i);

      // Confirma que a avaliação não aparece mais na listagem do filme
      const listagem = await request(app).get('/avaliacoes/filme/1');
      const idsRestantes = listagem.body.map((a: any) => a.id);
      expect(idsRestantes).not.toContain(avaliacaoId);
    });
  });
});