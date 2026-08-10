import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth-middleware';

/**
 * Define os papéis de acesso disponíveis para usuários do sistema.
 *
 * - `admin`: usuário com permissões administrativas.
 * - `comum`: usuário comum do sistema.
 */
export type Role = 'admin' | 'comum';

/**
 * Cria um middleware de autorização baseado no papel do usuário.
 *
 * Esse middleware verifica se o usuário está autenticado e se possui
 * um dos papéis informados na lista de permissões.
 *
 * @param papeisPermitidos Papéis que terão acesso à rota protegida.
 *
 * @returns Middleware Express responsável pela validação de autorização.
 *
 * @example
 * ```ts
 * router.get(
 *   '/admin',
 *   hasRole('admin'),
 *   controller.listarUsuarios
 * );
 * ```
 *
 * @example
 * ```ts
 * router.get(
 *   '/relatorios',
 *   hasRole('admin', 'usuario'),
 *   controller.gerarRelatorio
 * );
 * ```
 */
export function hasRole(...papeisPermitidos: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        /**
         * Verifica se existe um usuário autenticado na requisição.
         */
      res.status(401).json({ mensagem: 'Usuário não autenticado.' });
      return;
    }

     /**
         * Verifica se o papel do usuário está entre os papéis permitidos.
         */
    if (!papeisPermitidos.includes(req.user.role)) {
      res.status(403).json({
        mensagem: `Acesso restrito. Papéis permitidos: ${papeisPermitidos.join(', ')}.`,
      });
      return;
    }

    next();
  };
}
/**
 * Middleware de autorização exclusivo para administradores.
 *
 * Permite acesso apenas para usuários com papel `admin`.
 *
 * @example
 * ```ts
 * router.delete(
 *   '/usuarios/:id',
 *   isAdminRole,
 *   controller.removerUsuario
 * );
 * ```
 */
export const isAdminRole = hasRole('admin');