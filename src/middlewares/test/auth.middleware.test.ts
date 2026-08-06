import { Response, NextFunction } from 'express';
import {
    isAuthenticated,
    isAdmin,
    AuthenticatedRequest,
} from '../auth-middleware';

/**
 * Testes unitários para os middlewares de autenticação e autorização.
 *
 * @remarks
 * Diferente dos testes de rota (que usam `supertest` para simular
 * requisições HTTP completas), aqui os middlewares são testados
 * isoladamente: `req`, `res` e `next` são mockados manualmente,
 * sem subir a aplicação Express. Isso permite verificar exatamente
 * como cada middleware se comporta (o que ele chama, com quais
 * argumentos) sem depender de rotas reais.
 */
describe('Auth middleware', () => {

    /**
     * Cria um mock de `Request` para os testes.
     *
     * @param headers - Headers da requisição simulada (ex: `x-user-role`).
     * @param user - Usuário já autenticado, quando o teste precisa simular
     * uma requisição que já passou pelo `isAuthenticated`.
     * @returns Objeto parcial de `AuthenticatedRequest` para uso nos testes.
     */
    function criarRequestMock(
        headers: Record<string, string> = {},
        user?: AuthenticatedRequest['user']
    ): Partial<AuthenticatedRequest> {
        return {
            headers,
            user,
        };
    }

    /**
     * Cria um mock de `Response` para os testes.
     *
     * @remarks
     * `status` e `json` retornam `this` (o próprio mock) para permitir
     * encadeamento (`res.status(403).json(...)`), assim como o Express faz.
     *
     * @returns Objeto parcial de `Response` com `status`, `json` e
     * `redirect` mockados via `jest.fn()`.
     */
    function criarResponseMock(): Partial<Response> {
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.redirect = jest.fn().mockReturnValue(res);
        return res;
    }

    /**
     * describe: isAuthenticated
     *
     * Testa o middleware que simula autenticação via header `x-user-role`.
     */
    describe('isAuthenticated', () => {

        // Testa se uma requisição sem o header x-user-role é redirecionada para o login
        test('deve redirecionar para /login quando o header x-user-role não é enviado', () => {
            const req = criarRequestMock({}) as AuthenticatedRequest;
            const res = criarResponseMock() as Response;
            const next: NextFunction = jest.fn();

            isAuthenticated(req, res, next);

            expect(res.redirect).toHaveBeenCalledWith('/login');
            expect(next).not.toHaveBeenCalled();
        });

        // Testa se um usuário com header x-user-role "admin" é autenticado como admin
        test('deve popular req.user com role "admin" e chamar next quando o header for "admin"', () => {
            const req = criarRequestMock({ 'x-user-role': 'admin' }) as AuthenticatedRequest;
            const res = criarResponseMock() as Response;
            const next: NextFunction = jest.fn();

            isAuthenticated(req, res, next);

            expect(req.user).toEqual({
                id: 123,
                nome: 'Usuário Simulado',
                role: 'admin',
            });
            expect(next).toHaveBeenCalledTimes(1);
            expect(res.redirect).not.toHaveBeenCalled();
        });

        // Testa se qualquer valor diferente de "admin" no header cai no papel padrão "usuario"
        test('deve popular req.user com role "usuario" quando o header não for "admin"', () => {
            const req = criarRequestMock({ 'x-user-role': 'qualquer-coisa' }) as AuthenticatedRequest;
            const res = criarResponseMock() as Response;
            const next: NextFunction = jest.fn();

            isAuthenticated(req, res, next);

            expect(req.user).toEqual({
                id: 123,
                nome: 'Usuário Simulado',
                role: 'usuario',
            });
            expect(next).toHaveBeenCalledTimes(1);
        });
    });

    /**
     * describe: isAdmin
     *
     * Testa o middleware que restringe o acesso apenas a usuários
     * com role "admin".
     */
    describe('isAdmin', () => {

        // Testa se a requisição é bloqueada quando não há usuário autenticado
        test('deve retornar 403 e não chamar next quando req.user não existir', () => {
            const req = criarRequestMock({}, undefined) as AuthenticatedRequest;
            const res = criarResponseMock() as Response;
            const next: NextFunction = jest.fn();

            isAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                mensagem: 'Acsso restrito a administradores.',
            });
            expect(next).not.toHaveBeenCalled();
        });

        // Testa se a requisição é bloqueada quando o usuário autenticado não é admin
        test('deve retornar 403 e não chamar next quando req.user.role for "usuario"', () => {
            const req = criarRequestMock({}, {
                id: 1,
                nome: 'Usuário Comum',
                role: 'usuario',
            }) as AuthenticatedRequest;
            const res = criarResponseMock() as Response;
            const next: NextFunction = jest.fn();

            isAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });

        // Testa se um usuário admin passa pelo middleware sem bloqueios
        test('deve chamar next e não responder nada quando req.user.role for "admin"', () => {
            const req = criarRequestMock({}, {
                id: 1,
                nome: 'Usuário Admin',
                role: 'admin',
            }) as AuthenticatedRequest;
            const res = criarResponseMock() as Response;
            const next: NextFunction = jest.fn();

            isAdmin(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
