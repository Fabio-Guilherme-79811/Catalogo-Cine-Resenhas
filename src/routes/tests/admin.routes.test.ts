import request from 'supertest';
import app from '../../app'; // ajuste este caminho conforme a localização real do seu app Express
import { criarUsuarioAutenticado } from './helpers/auth-test-helper';

/**
 * Testes de integração para as rotas administrativas (`admin-routes.ts`),
 * montadas em `/admin` na aplicação principal.
 *
 * @remarks
 * Todas as rotas deste router exigem autenticação e papel de admin
 * (`router.use(isAuthenticated, isAdmin)`). A autenticação usa o fluxo
 * real de login (JWT via cookie, ver `criarUsuarioAutenticado`), e os
 * dados manipulados (usuários) são persistidos de verdade via
 * `UsuarioRepository`, e não mais mockados em memória.
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
            const { cookie } = await criarUsuarioAutenticado(app, { role: 'comum' });

            const response = await request(app)
                .get('/admin')
                .set('Cookie', cookie);

            expect(response.statusCode).toBe(403);
        });
    });

    /* ------------------------------------------------------------------ */
    /*  GET /admin                                                        */
    /* ------------------------------------------------------------------ */

    describe('GET /admin', () => {

        // Testa se a mensagem de boas-vindas e as seções do painel são retornadas para um admin
        test('deve retornar mensagem de boas-vindas com o nome do usuário e a lista de seções', async () => {
            const { cookie } = await criarUsuarioAutenticado(app, { role: 'admin', nome: 'Admin Boas Vindas' });

            const response = await request(app)
                .get('/admin')
                .set('Cookie', cookie);

            expect(response.statusCode).toBe(200);
            expect(response.body.mensagem).toContain('Admin Boas Vindas');
            expect(response.body.secoes).toEqual(['usuario', 'estatisticas', 'configuracoes']);
        });
    });

    /* ------------------------------------------------------------------ */
    /*  GET /admin/usuarios                                               */
    /* ------------------------------------------------------------------ */

    describe('GET /admin/usuarios', () => {

        // Testa se a lista de usuários cadastrados é retornada para um admin, sem o hash de senha
        test('deve retornar a lista de usuários cadastrados', async () => {
            const { cookie } = await criarUsuarioAutenticado(app, { role: 'admin' });
            const { usuario: usuarioComum } = await criarUsuarioAutenticado(app, { role: 'comum' });

            const response = await request(app)
                .get('/admin/usuarios')
                .set('Cookie', cookie);

            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.some((u: any) => u.id === usuarioComum.id)).toBe(true);
            expect(response.body.every((u: any) => u.senhaHash === undefined)).toBe(true);
        });
    });

    /* ------------------------------------------------------------------ */
    /*  GET /admin/usuarios/:id                                           */
    /* ------------------------------------------------------------------ */

    describe('GET /admin/usuarios/:id', () => {

        // Testa se o detalhe do usuário é retornado com o id correto vindo da URL
        test('deve retornar os dados do usuário com o id informado', async () => {
            const { cookie } = await criarUsuarioAutenticado(app, { role: 'admin' });
            const { usuario } = await criarUsuarioAutenticado(app, { role: 'comum', nome: 'Usuário Detalhe' });

            const response = await request(app)
                .get(`/admin/usuarios/${usuario.id}`)
                .set('Cookie', cookie);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({ id: usuario.id, nome: 'Usuário Detalhe' })
            );
        });

        // Testa se um id inexistente retorna 404
        test('deve retornar 404 quando o usuário não existir', async () => {
            const { cookie } = await criarUsuarioAutenticado(app, { role: 'admin' });

            const response = await request(app)
                .get('/admin/usuarios/id-inexistente')
                .set('Cookie', cookie);

            expect(response.statusCode).toBe(404);
        });
    });

    /* ------------------------------------------------------------------ */
    /*  PUT /admin/usuarios/:id                                           */
    /* ------------------------------------------------------------------ */

    describe('PUT /admin/usuarios/:id', () => {

        // Testa se a atualização de um usuário retorna mensagem de confirmação com os dados atualizados
        test('deve retornar mensagem de confirmação com o id e os dados atualizados', async () => {
            const { cookie } = await criarUsuarioAutenticado(app, { role: 'admin' });
            const { usuario } = await criarUsuarioAutenticado(app, { role: 'comum' });

            const dadosAtualizados = { nome: 'Novo Nome' };

            const response = await request(app)
                .put(`/admin/usuarios/${usuario.id}`)
                .set('Cookie', cookie)
                .send(dadosAtualizados);

            expect(response.statusCode).toBe(200);
            expect(response.body.mensagem).toContain(`Usuário ${usuario.id} atualizado com sucesso.`);
            expect(response.body.dados.nome).toBe('Novo Nome');
        });

        // Testa se a atualização de um usuário inexistente retorna 404
        test('deve retornar 404 quando o usuário a ser atualizado não existir', async () => {
            const { cookie } = await criarUsuarioAutenticado(app, { role: 'admin' });

            const response = await request(app)
                .put('/admin/usuarios/id-inexistente')
                .set('Cookie', cookie)
                .send({ nome: 'Novo Nome' });

            expect(response.statusCode).toBe(404);
        });
    });

    /* ------------------------------------------------------------------ */
    /*  DELETE /admin/usuario/:id                                         */
    /* ------------------------------------------------------------------ */

    describe('DELETE /admin/usuario/:id', () => {

        // Testa se a remoção de um usuário retorna mensagem de confirmação com o id correto
        test('deve retornar mensagem de confirmação da remoção com o id informado', async () => {
            const { cookie } = await criarUsuarioAutenticado(app, { role: 'admin' });
            const { usuario } = await criarUsuarioAutenticado(app, { role: 'comum' });

            const response = await request(app)
                .delete(`/admin/usuario/${usuario.id}`)
                .set('Cookie', cookie);

            expect(response.statusCode).toBe(200);
            expect(response.body.mensagem).toBe(`Usuário ${usuario.id} removido com sucesso.`);
        });
    });

    /* ------------------------------------------------------------------ */
    /*  GET /admin/estatisticas                                           */
    /* ------------------------------------------------------------------ */

    describe('GET /admin/estatisticas', () => {

        // Testa se as métricas reais do sistema são retornadas para um admin
        test('deve retornar as métricas reais do sistema', async () => {
            const { cookie } = await criarUsuarioAutenticado(app, { role: 'admin' });

            const response = await request(app)
                .get('/admin/estatisticas')
                .set('Cookie', cookie);

            expect(response.statusCode).toBe(200);
            expect(typeof response.body.totalUsuario).toBe('number');
            expect(typeof response.body.novosCadastrosSemana).toBe('number');
            expect(typeof response.body.visitasLandingPage).toBe('number');
            // O próprio admin recém-criado já conta como cadastro da semana
            expect(response.body.totalUsuario).toBeGreaterThan(0);
            expect(response.body.novosCadastrosSemana).toBeGreaterThan(0);
        });
    });
});
