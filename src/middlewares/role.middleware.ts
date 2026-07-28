import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth-middleware';

export type Role = 'admin' | 'usuario';

export function hasRole(...papeisPermitidos: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ mensagem: 'Usuário não autenticado.' });
      return;
    }

    if (!papeisPermitidos.includes(req.user.role)) {
      res.status(403).json({
        mensagem: `Acesso restrito. Papéis permitidos: ${papeisPermitidos.join(', ')}.`,
      });
      return;
    }

    next();
  };
}
export const isAdminRole = hasRole('admin');