import {Request, Response, NextFunction} from 'express';

export interface AuthenticatedRequest extends Request{
    user?:{
        id:number | string;
        nome:string;
        role: 'admin'|'usuario';
    };

}
    export function isAuthenticated(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): void {
    
    const usuarioSimulado = req.headers['x-user-role'];

    if(!usuarioSimulado){
        res.redirect('/login');
        return;
    }

    req.user = {
        id: 123,
        nome: 'Usuário Simulado',
        role: usuarioSimulado === 'admin'? 'admin' : 'usuario',
    };

    next();
}

    export function isAdmin(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): void {
        if(!req.user || req.user.role !== 'admin') {
            res.status(403).json ({ mensagem : 'Acsso restrito a administradores.'});
        }

        next();
    }

