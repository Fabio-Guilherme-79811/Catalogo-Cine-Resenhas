import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth-middleware';
import { hasRole, isAdminRole } from '../role.middleware';

/**
 * Testes unitários para o middleware de autorização baseado em papéis
 * (`hasRole` e o atalho `isAdminRole`).
 *
 * @remarks
 * Assim como nos testes do `auth-middleware`, `req`, `res` e `next` são
 * mockados manualmente, sem subir a aplicação Express, para isolar o
 * comportamento do middleware.
 */
describe('Role middleware', () => {

    /**
     * Cria um mock de `Request` já autenticado (ou não) para os testes.
     *
     * @param user - Usuário autenticado a ser colocado em `req.user`.
     * Se omitido, simula uma requisição sem autenticação.
     * @returns Objeto parcial de `AuthenticatedRequest` para uso nos testes.
     */
    function criarRequestMock(
        user?: AuthenticatedRequest['user']
    ): Partial<AuthenticatedRequest> {
        return { user };
    }

    /**
     * Cria um mock de `Response` para os testes.
     *
     * @remarks
     * `status` retorna `this` (o próprio mock) para permitir o
     * encadeamento `res.status(403).json(...)`, assim como o Express faz.
     *
     * @returns Objeto parcial de `Response` com `status` e `json` mockados
     * via `jest.fn()`.
     */
    function criarResponseMock(): Partial<Response> {
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    }

    /**
     * describe: hasRole
     *
     * Testa a factory de middleware que restringe o acesso a uma
     * lista de papéis permitidos.
     */
    describe('hasRole', () => {

        // Testa se a requisição é bloqueada com 401 quando não há usuário autenticado
        test('deve retornar 401 e não chamar next quando req.user não existir', () => {
            const req = criarRequestMock(undefined) as AuthenticatedRequest;
            const res = criarResponseMock() as Response;
            const next: NextFunction = jest.fn();
            const middleware = hasRole('admin');

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                mensagem: 'Usuário não autenticado.',
            });
            expect(next).not.toHaveBeenCalled();
        });

        // Testa se a requisição é bloqueada com 403 quando o papel do usuário não está na lista permitida
        test('deve retornar 403 e não chamar next quando o papel do usuário não estiver na lista permitida', () => {
            const req = criarRequestMock({
                id: 1,
                nome: 'Usuário Comum',
                role: 'comum',
            }) as AuthenticatedRequest;
            const res = criarResponseMock() as Response;
            const next: NextFunction = jest.fn();
            const middleware = hasRole('admin');

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                mensagem: 'Acesso restrito. Papéis permitidos: admin.',
            });
            expect(next).not.toHaveBeenCalled();
        });

        // Testa se next é chamado quando o papel do usuário está na lista permitida
        test('deve chamar next e não responder nada quando o papel do usuário estiver na lista permitida', () => {
            const req = criarRequestMock({
                id: 1,
                nome: 'Usuário Admin',
                role: 'admin',
            }) as AuthenticatedRequest;
            const res = criarResponseMock() as Response;
            const next: NextFunction = jest.fn();
            const middleware = hasRole('admin');

            middleware(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        // Testa se, com múltiplos papéis permitidos, qualquer um deles é aceito
        test('deve chamar next quando o papel do usuário estiver entre múltiplos papéis permitidos', () => {
            const req = criarRequestMock({
                id: 2,
                nome: 'Usuário Comum',
                role: 'comum',
            }) as AuthenticatedRequest;
            const res = criarResponseMock() as Response;
            const next: NextFunction = jest.fn();
            const middleware = hasRole('admin', 'comum');

            middleware(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });
    });

    /**
     * describe: isAdminRole
     *
     * Testa o atalho de middleware pré-configurado apenas para
     * administradores (`hasRole('admin')`).
     */
    describe('isAdminRole', () => {

        // Testa se um administrador passa pelo middleware sem bloqueios
        test('deve chamar next quando o usuário for admin', () => {
            const req = criarRequestMock({
                id: 1,
                nome: 'Usuário Admin',
                role: 'admin',
            }) as AuthenticatedRequest;
            const res = criarResponseMock() as Response;
            const next: NextFunction = jest.fn();

            isAdminRole(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        // Testa se um usuário comum é bloqueado com 403
        test('deve retornar 403 quando o usuário não for admin', () => {
            const req = criarRequestMock({
                id: 2,
                nome: 'Usuário Comum',
                role: 'comum',
            }) as AuthenticatedRequest;
            const res = criarResponseMock() as Response;
            const next: NextFunction = jest.fn();

            isAdminRole(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
