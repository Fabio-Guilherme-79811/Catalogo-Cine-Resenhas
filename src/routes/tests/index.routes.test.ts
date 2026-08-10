import request from 'supertest';
import app from '../../app'; // ajuste este caminho conforme a localização real do seu app Express

/**
 * Teste de regressão para a ordem de montagem das rotas em
 * `index-routes.ts`.
 *
 * @remarks
 * `paginasRoutes` precisa ser montado antes de `landingRoutes` e
 * `authRoutes` (ver comentário em `index-routes.ts`). Hoje,
 * `landing-routes.ts` e `auth-routes.ts` não possuem mais handlers
 * para `/login` e `/cadastro` — mas, caso alguém reintroduza esses
 * handlers ou reordene os `router.use(...)`, o comportamento correto
 * (renderizar a página, e não redirecionar) deve continuar valendo.
 * Este teste bate na aplicação completa (com todas as sub-rotas já
 * montadas), não apenas em `paginas-routes.ts` isoladamente, para
 * pegar justamente esse tipo de regressão de ordem de montagem.
 */
describe('Ordem de montagem das rotas (index-routes)', () => {

    // Testa se GET /login renderiza a página de login (200), e não é
    // interceptado por um possível redirecionamento vindo de outro router
    test('GET /login deve renderizar a página de login, não redirecionar', async () => {
        const response = await request(app).get('/login');

        expect(response.statusCode).toBe(200);
    });

    // Testa se GET /cadastro renderiza a página de cadastro (200), e não é
    // interceptado por um possível redirecionamento vindo de outro router
    test('GET /cadastro deve renderizar a página de cadastro, não redirecionar', async () => {
        const response = await request(app).get('/cadastro');

        expect(response.statusCode).toBe(200);
    });
});
