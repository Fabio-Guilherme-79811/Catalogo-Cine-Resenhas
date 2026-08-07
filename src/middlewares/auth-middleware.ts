import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

/**
 * Segredo utilizado para assinar/verificar o token JWT de sessão.
 *
 * @remarks
 * Em produção, defina a variável de ambiente `JWT_SECRET`. O valor abaixo
 * é apenas um fallback para desenvolvimento local.
 */
export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_troque_em_producao';

/** Nome do cookie onde o token de sessão é armazenado. */
export const AUTH_COOKIE_NAME = 'token';

/**
 * Formato dos dados do usuário armazenados dentro do token JWT.
 */
export interface UsuarioTokenPayload {
    id: string;
    nome: string;
    role: 'admin' | 'comum';
}

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
        role: 'admin' | 'comum';
    };

}

/**
 * Faz o parse manual do header `Cookie` da requisição.
 *
 * @remarks
 * O projeto não utiliza o pacote `cookie-parser`, então o parsing é feito
 * aqui mesmo, de forma simples, apenas para os cookies que a aplicação usa.
 *
 * @param req - Requisição HTTP.
 * @returns Um objeto com os pares nome/valor dos cookies enviados.
 */
export function parseCookies(req: Request): Record<string, string> {
    const header = req.headers.cookie;
    const cookies: Record<string, string> = {};

    if (!header) return cookies;

    header.split(';').forEach((parte) => {
        const [nome, ...resto] = parte.trim().split('=');
        if (!nome) return;
        cookies[nome] = decodeURIComponent(resto.join('='));
    });

    return cookies;
}

/**
 * Extrai e valida o usuário autenticado a partir do token JWT presente
 * no cookie da requisição, sem interromper o fluxo caso não exista/seja
 * inválido.
 *
 * @param req - Requisição HTTP.
 * @returns Os dados do usuário decodificados do token, ou `null`.
 */
export function obterUsuarioDoToken(req: Request): UsuarioTokenPayload | null {
    const cookies = parseCookies(req);
    const token = cookies[AUTH_COOKIE_NAME];

    if (!token) return null;

    try {
        return jwt.verify(token, JWT_SECRET) as UsuarioTokenPayload;
    } catch {
        return null;
    }
}

/**
 * Middleware responsável por verificar se existe um usuário autenticado.
 *
 * Lê o token JWT de sessão do cookie `token` (definido no login, ver
 * `POST /entrar` em `auth-routes.ts`), valida sua assinatura/expiração e
 * disponibiliza os dados do usuário em `req.user`.
 *
 * Caso o usuário não esteja autenticado (cookie ausente, token inválido
 * ou expirado), redireciona para a tela de login.
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
    const usuario = obterUsuarioDoToken(req);

    if (!usuario) {
        res.redirect('/login');
        return;
    }

    req.user = usuario;

    next();
}

/**
 * Middleware que, se houver um token válido no cookie, popula `req.user`
 * e `res.locals.usuario` (para as views EJS) — mas NUNCA bloqueia a
 * requisição caso não exista usuário autenticado.
 *
 * @remarks
 * Deve ser montado globalmente em `app.ts` para que a navbar (`nav.ejs`)
 * saiba exibir "Entrar/Cadastrar" ou o menu do usuário logado em
 * qualquer página, mesmo nas que não exigem login.
 */
export function carregarUsuarioOpcional(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    const usuario = obterUsuarioDoToken(req);

    if (usuario) {
        req.user = usuario;
        res.locals.usuario = usuario;
        // nav.ejs (navbar + sidebar) usa o nome `usuarioAtual` — mantido
        // igual a `res.locals.usuario` pra não quebrar quem já lê um ou
        // outro nome.
        res.locals.usuarioAtual = usuario;
    } else {
        res.locals.usuario = null;
        res.locals.usuarioAtual = null;
    }

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
            res.status(403).json ({ mensagem : 'Acesso restrito a administradores.'});
            return;
        }

        next();
    }
