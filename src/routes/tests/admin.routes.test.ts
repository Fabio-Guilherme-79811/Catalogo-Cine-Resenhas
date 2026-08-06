import request from 'supertest';
import app from '../../app'; // ajuste este caminho conforme a localização real do seu app Express

/**
 * Testes de integração para as rotas administrativas (`admin-routes.ts`),
 * montadas em `/admin` na aplicação principal.
 *
 * @remarks
 * Todas as rotas deste router exigem autenticação e papel de admin
 * (`router.use(isAuthenticated, isAdmin)`), simulados aqui via o header
 * `x-user-role`, conforme implementado em `auth-middleware.ts`.
 */
describe('Admin routes', () => {

    /* ------------------------------------------------------------------ */
    /*  AUTENTICAÇÃO E AUTORIZAÇÃO (aplicam-se a todas as rotas do router) */
    /* ------------------------------------------------------------------ */

    describe('Proteção de acesso', () => {

        // Testa se uma requisição sem autenticação é redirecionada para o login
        test('deve redirecionar para /login quando não houver usuário autenticado', async () => {
            const response = await request(app).get('/admin');

            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe('/login');
        });

        // Testa se um usuário autenticado sem papel de admin é bloqueado
        test('deve retornar 403 quando o usuário autenticado não for admin', async () => {
            const response = await request(app)
                .get('/admin')
                .set('x-user-role', 'usuario');

            expect(response.statusCode).toBe(403);
        });
    });

    /* ------------------------------------------------------------------ */
    /*  GET /admin                                                        */
    /* ------------------------------------------------------------------ */

    describe('GET /admin', () => {

        // Testa se a mensagem de boas-vindas e as seções do painel são retornadas para um admin
        test('deve retornar mensagem de boas-vindas com o nome do usuário e a lista de seções', async () => {
            const response = await request(app)
                .get('/admin')
                .set('x-user-role', 'admin');

            expect(response.statusCode).toBe(200);
            expect(response.body.mensagem).toContain('Usuário Simulado');
            expect(response.body.secoes).toEqual(['usuario', 'estatisticas', 'configuracoes']);
        });
    });

    /* ------------------------------------------------------------------ */
    /*  GET /admin/usuarios                                               */
    /* ------------------------------------------------------------------ */

    describe('GET /admin/usuarios', () => {

        // Testa se a lista de usuários mockados é retornada para um admin
        test('deve retornar a lista de usuários', async () => {
            const response = await request(app)
                .get('/admin/usuarios')
                .set('x-user-role', 'admin');

            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toEqual(
                expect.objectContaining({ id: '1', role: 'usuario' })
            );
            expect(response.body[1]).toEqual(
                expect.objectContaining({ id: '2', role: 'admin' })
            );
        });
    });

    /* ------------------------------------------------------------------ */
    /*  GET /admin/usuarios/:id                                           */
    /* ------------------------------------------------------------------ */

    describe('GET /admin/usuarios/:id', () => {

        // Testa se o detalhe do usuário é retornado com o id correto vindo da URL
        test('deve retornar os dados do usuário com o id informado', async () => {
            const response = await request(app)
                .get('/admin/usuarios/1')
                .set('x-user-role', 'admin');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({ id: '1', nome: 'Usuário exemplo' })
            );
        });
    });

    /* ------------------------------------------------------------------ */
    /*  PUT /admin/usuarios/:id                                           */
    /* ------------------------------------------------------------------ */

    describe('PUT /admin/usuarios/:id', () => {

        // Testa se a atualização de um usuário retorna mensagem de confirmação com os dados enviados
        test('deve retornar mensagem de confirmação com o id e os dados atualizados', async () => {
            const dadosAtualizados = { nome: 'Novo Nome', email: 'novo@exemplo.com' };

            const response = await request(app)
                .put('/admin/usuarios/1')
                .set('x-user-role', 'admin')
                .send(dadosAtualizados);

            expect(response.statusCode).toBe(200);
            expect(response.body.mensagem).toContain('Usuário 1 atualizado com sucesso.');
            expect(response.body.dados).toEqual(dadosAtualizados);
        });
    });

    /* ------------------------------------------------------------------ */
    /*  DELETE /admin/usuario/:id                                         */
    /* ------------------------------------------------------------------ */

    describe('DELETE /admin/usuario/:id', () => {

        // Testa se a remoção de um usuário retorna mensagem de confirmação com o id correto
        test('deve retornar mensagem de confirmação da remoção com o id informado', async () => {
            const response = await request(app)
                .delete('/admin/usuario/1')
                .set('x-user-role', 'admin');

            expect(response.statusCode).toBe(200);
            expect(response.body.mensagem).toBe('Usuário 1 removido com sucesso.');
        });
    });

    /* ------------------------------------------------------------------ */
    /*  GET /admin/estatisticas                                           */
    /* ------------------------------------------------------------------ */

    describe('GET /admin/estatisticas', () => {

        // Testa se as métricas mockadas do sistema são retornadas para um admin
        test('deve retornar as métricas do sistema', async () => {
            const response = await request(app)
                .get('/admin/estatisticas')
                .set('x-user-role', 'admin');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                totalUsuario: 128,
                novosCadastrosSemana: 14,
                visitasLandingPage: 3520,
            });
        });
    });
});
