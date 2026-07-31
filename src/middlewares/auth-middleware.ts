import {Request, Response, NextFunction} from 'express';

/**
 * Extensão da interface Request do Express contendo
 * informações do usuário autenticado.
 */
export interface AuthenticatedRequest extends Request{
    /**
     * Dados do usuário autenticado na requisição.
     */
    user?:{
        /** Identificador do usuário. */
        id: number | string;

        /** Nome do usuário. */
        nome: string;

        /** Papel de acesso do usuário. */
        role: 'admin' | 'usuario';
    };

}
/**
 * Middleware responsável por verificar se existe um usuário autenticado.
 *
 * Atualmente utiliza o header `x-user-role` como simulação de autenticação.
 * Em uma aplicação real, essa validação deve ser substituída por um sistema
 * de sessão, JWT ou outro mecanismo de autenticação seguro.
 *
 * Caso o usuário não esteja autenticado, redireciona para a tela de login.
 *
 * @param req Requisição HTTP contendo os dados do usuário.
 * @param res Resposta HTTP utilizada para redirecionamento.
 * @param next Função para continuar a execução do próximo middleware.
 */
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

/**
 * Middleware responsável por restringir acesso apenas a administradores.
 *
 * Verifica se existe um usuário autenticado e se seu papel é `admin`.
 *
 * Caso o usuário não possua permissão administrativa, retorna erro HTTP 403.
 *
 * @param req Requisição HTTP contendo o usuário autenticado.
 * @param res Resposta HTTP.
 * @param next Função para continuar a execução do próximo middleware.
 */
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

