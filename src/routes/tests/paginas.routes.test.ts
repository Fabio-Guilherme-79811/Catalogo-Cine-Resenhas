import request from 'supertest';
import app from '../../app'; // ajuste este caminho conforme a localização real do seu app Express
import { filmes, Filme } from '../conteudo-routes';

/**
 * Testes de integração para as rotas de renderização de páginas
 * (`paginas-routes.ts`).
 *
 * @remarks
 * Diferente dos testes de middleware (que mockam `req`/`res`/`next`
 * manualmente), aqui usamos `supertest` para simular requisições HTTP
 * reais contra a aplicação Express, verificando tanto o status code
 * quanto o conteúdo do HTML renderizado (`response.text`).
 *
 * A autenticação/autorização é simulada via o header `x-user-role`,
 * conforme implementado em `auth-middleware.ts` (`isAuthenticated`)
 * e `role.middleware.ts` / `isAdmin` (`admin-middleware.ts`).
 */
describe('Páginas routes', () => {

    /* ------------------------------------------------------------------ */
    /*  LOGIN E CADASTRO                                                  */
    /* ------------------------------------------------------------------ */

    describe('GET /login', () => {

        // Testa se a página de login é renderizada com sucesso
        test('deve retornar 200 e renderizar a página de login', async () => {
            const response = await request(app).get('/login');

            expect(response.statusCode).toBe(200);
        });
    });

    describe('GET /cadastro', () => {

        // Testa se a página de cadastro é renderizada com sucesso
        test('deve retornar 200 e renderizar a página de cadastro', async () => {
            const response = await request(app).get('/cadastro');

            expect(response.statusCode).toBe(200);
        });
    });

    /* ------------------------------------------------------------------ */
    /*  CATÁLOGO                                                          */
    /* ------------------------------------------------------------------ */

    describe('GET /catalogo', () => {

        // Testa se todos os filmes publicados aparecem quando nenhum filtro é aplicado
        test('deve listar todos os filmes publicados quando nenhum gênero for informado', async () => {
            const response = await request(app).get('/catalogo');

            expect(response.statusCode).toBe(200);
            expect(response.text).toContain('Filme Exemplo 1');
            expect(response.text).toContain('Filme Exemplo 2');
        });

        // Testa se o filtro por gênero retorna apenas os filmes correspondentes
        test('deve listar apenas os filmes do gênero informado no filtro', async () => {
            const response = await request(app).get('/catalogo?genero=Drama');

            expect(response.statusCode).toBe(200);
            expect(response.text).toContain('Filme Exemplo 1');
            expect(response.text).not.toContain('Filme Exemplo 2');
        });

        // Testa se um gênero inexistente retorna a página sem nenhum filme listado
        test('deve retornar a página sem filmes quando o gênero não existir no catálogo', async () => {
            const response = await request(app).get('/catalogo?genero=Comedia');

            expect(response.statusCode).toBe(200);
            expect(response.text).not.toContain('Filme Exemplo 1');
            expect(response.text).not.toContain('Filme Exemplo 2');
        });

        // Testa se um filme marcado como não publicado não aparece no catálogo
        test('não deve listar filmes marcados como não publicados', async () => {
            const filmeNaoPublicado: Filme = {
                id: '99',
                titulo: 'Filme Não Publicado De Teste',
                sinopse: 'Sinopse de teste.',
                genero: 'Terror',
                anoLancamento: 2025,
                publicado: false,
            };
            filmes.push(filmeNaoPublicado);

            try {
                const response = await request(app).get('/catalogo');

                expect(response.statusCode).toBe(200);
                expect(response.text).not.toContain('Filme Não Publicado De Teste');
            } finally {
                // Remove o filme de teste para não afetar outros testes que dependam do mock
                const index = filmes.findIndex((f) => f.id === '99');
                if (index !== -1) filmes.splice(index, 1);
            }
        });
    });

    /* ------------------------------------------------------------------ */
    /*  DETALHES DO FILME                                                 */
    /* ------------------------------------------------------------------ */

    describe('GET /filmes/:id', () => {

        // Testa se os detalhes de um filme publicado são exibidos corretamente
        test('deve retornar 200 e exibir os detalhes de um filme publicado existente', async () => {
            const response = await request(app).get('/filmes/1');

            expect(response.statusCode).toBe(200);
            expect(response.text).toContain('Filme Exemplo 1');
        });

        // Testa se um id inexistente retorna a página de erro 404
        test('deve retornar 404 quando o filme não existir', async () => {
            const response = await request(app).get('/filmes/id-inexistente');

            expect(response.statusCode).toBe(404);
        });

        // Testa se um filme existente mas não publicado também retorna 404
        test('deve retornar 404 quando o filme existir mas não estiver publicado', async () => {
            const filmeNaoPublicado: Filme = {
                id: '98',
                titulo: 'Filme Não Publicado De Teste',
                sinopse: 'Sinopse de teste.',
                genero: 'Terror',
                anoLancamento: 2025,
                publicado: false,
            };
            filmes.push(filmeNaoPublicado);

            try {
                const response = await request(app).get('/filmes/98');

                expect(response.statusCode).toBe(404);
            } finally {
                const index = filmes.findIndex((f) => f.id === '98');
                if (index !== -1) filmes.splice(index, 1);
            }
        });
    });

    /* ------------------------------------------------------------------ */
    /*  PAINEL ADMINISTRATIVO                                             */
    /* ------------------------------------------------------------------ */

    describe('GET /painel-admin', () => {

        // Testa se um usuário não autenticado é redirecionado para o login
        test('deve redirecionar para /login quando não houver usuário autenticado', async () => {
            const response = await request(app).get('/painel-admin');

            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe('/login');
        });

        // Testa se um usuário autenticado sem papel de admin é bloqueado
        test('deve retornar 403 quando o usuário autenticado não for admin', async () => {
            const response = await request(app)
                .get('/painel-admin')
                .set('x-user-role', 'usuario');

            expect(response.statusCode).toBe(403);
        });

        // Testa se um administrador consegue acessar o painel normalmente
        test('deve retornar 200 quando o usuário autenticado for admin', async () => {
            const response = await request(app)
                .get('/painel-admin')
                .set('x-user-role', 'admin');

            expect(response.statusCode).toBe(200);
        });
    });

    describe('GET /painel-admin/filmes/novo', () => {

        // Testa se um usuário não autenticado é redirecionado para o login
        test('deve redirecionar para /login quando não houver usuário autenticado', async () => {
            const response = await request(app).get('/painel-admin/filmes/novo');

            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe('/login');
        });

        // Testa se um administrador consegue acessar o formulário de novo filme
        test('deve retornar 200 e exibir o formulário vazio para um admin', async () => {
            const response = await request(app)
                .get('/painel-admin/filmes/novo')
                .set('x-user-role', 'admin');

            expect(response.statusCode).toBe(200);
        });
    });

    describe('GET /painel-admin/filmes/:id/editar', () => {

        // Testa se um administrador consegue acessar o formulário de edição com os dados do filme
        test('deve retornar 200 e exibir os dados do filme para edição quando o id for válido', async () => {
            const response = await request(app)
                .get('/painel-admin/filmes/1/editar')
                .set('x-user-role', 'admin');

            expect(response.statusCode).toBe(200);
            expect(response.text).toContain('Filme Exemplo 1');
        });

        // Testa se um id inexistente retorna 404 mesmo para um admin
        test('deve retornar 404 quando o filme a ser editado não existir', async () => {
            const response = await request(app)
                .get('/painel-admin/filmes/id-inexistente/editar')
                .set('x-user-role', 'admin');

            expect(response.statusCode).toBe(404);
        });
    });
});
