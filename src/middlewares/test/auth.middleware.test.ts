import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  isAuthenticated,
  isAdmin,
  AuthenticatedRequest,
  AUTH_COOKIE_NAME,
  JWT_SECRET,
} from '../auth-middleware';

/**
 * Testes unitários para os middlewares de autenticação e autorização.
 *
 * @remarks
 * Diferente dos testes de rota (que usam `supertest` para simular
 * requisições HTTP completas), aqui os middlewares são testados
 * isoladamente: `req`, `res` e `next` são mockados manualmente,
 * sem subir a aplicação Express. A autenticação real é feita via
 * cookie JWT (ver `auth-middleware.ts`), então os mocks simulam o
 * header `Cookie` contendo o token assinado.
 */
describe('Auth middleware', () => {
  /**
   * Cria um mock de `Request` para os testes.
   *
   * @param cookieHeader - Valor bruto do header `Cookie` da requisição simulada.
   * @returns Objeto parcial de `AuthenticatedRequest` para uso nos testes.
   */
  function criarRequestMock(cookieHeader?: string): Partial<AuthenticatedRequest> {
    return {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    };
  }

  /**
   * Gera um cookie de sessão válido (mesmo formato usado pelo login real).
   */
  function criarCookieValido(payload: AuthenticatedRequest['user']): string {
    const token = jwt.sign(payload as object, JWT_SECRET, { expiresIn: '2h' });
    return `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`;
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
   * Testa o middleware que autentica o usuário via cookie JWT de sessão.
   */
  describe('isAuthenticated', () => {
    // Testa se uma requisição sem cookie de sessão é redirecionada para o login
    test('deve redirecionar para /login quando não houver cookie de sessão', () => {
      const req = criarRequestMock() as AuthenticatedRequest;
      const res = criarResponseMock() as Response;
      const next: NextFunction = jest.fn();

      isAuthenticated(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(next).not.toHaveBeenCalled();
    });

    // Testa se uma requisição com token inválido/adulterado é redirecionada para o login
    test('deve redirecionar para /login quando o token do cookie for inválido', () => {
      const req = criarRequestMock(`${AUTH_COOKIE_NAME}=token-invalido`) as AuthenticatedRequest;
      const res = criarResponseMock() as Response;
      const next: NextFunction = jest.fn();

      isAuthenticated(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(next).not.toHaveBeenCalled();
    });

    // Testa se um cookie válido com role "admin" popula req.user corretamente
    test('deve popular req.user com role "admin" e chamar next quando o cookie for válido', () => {
      const cookie = criarCookieValido({ id: '123', nome: 'Usuário Admin', role: 'admin' });
      const req = criarRequestMock(cookie) as AuthenticatedRequest;
      const res = criarResponseMock() as Response;
      const next: NextFunction = jest.fn();

      isAuthenticated(req, res, next);

      expect(req.user).toEqual(
        expect.objectContaining({ id: '123', nome: 'Usuário Admin', role: 'admin' }),
      );
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    // Testa se um cookie válido com role "comum" popula req.user corretamente
    test('deve popular req.user com role "comum" e chamar next quando o cookie for válido', () => {
      const cookie = criarCookieValido({ id: '1', nome: 'Usuário Comum', role: 'comum' });
      const req = criarRequestMock(cookie) as AuthenticatedRequest;
      const res = criarResponseMock() as Response;
      const next: NextFunction = jest.fn();

      isAuthenticated(req, res, next);

      expect(req.user).toEqual(
        expect.objectContaining({ id: '1', nome: 'Usuário Comum', role: 'comum' }),
      );
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
      const req = criarRequestMock() as AuthenticatedRequest;
      const res = criarResponseMock() as Response;
      const next: NextFunction = jest.fn();

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Acesso restrito a administradores.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    // Testa se a requisição é bloqueada quando o usuário autenticado não é admin
    test('deve retornar 403 e não chamar next quando req.user.role for "comum"', () => {
      const req = criarRequestMock() as AuthenticatedRequest;
      req.user = {
        id: 1,
        nome: 'Usuário Comum',
        role: 'comum',
      };
      const res = criarResponseMock() as Response;
      const next: NextFunction = jest.fn();

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    // Testa se um usuário admin passa pelo middleware sem bloqueios
    test('deve chamar next e não responder nada quando req.user.role for "admin"', () => {
      const req = criarRequestMock() as AuthenticatedRequest;
      req.user = {
        id: 1,
        nome: 'Usuário Admin',
        role: 'admin',
      };
      const res = criarResponseMock() as Response;
      const next: NextFunction = jest.fn();

      isAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
