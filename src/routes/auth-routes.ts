import {Router, Request, Response} from 'express'

const router = Router();

// URL base do serviço de autenticação, definida via variável de ambiente
// Se não estiver definida, cai no fallback de rotas locais (/auth/...)
/**
 * URL base do serviço de autenticação, definida via variável de ambiente.
 *
 * @remarks
 * Se não estiver definida, o fallback é utilizar as rotas locais (`/auth/...`).
 */
const AUTH_BASE_URL = process.env.AUTH_BASE_URL || '';

// Rota GET /login: redireciona para o serviço externo de login (se configurado)
// ou para a rota local /auth/login como fallback
/**
 * Redireciona para o serviço externo de login, se `AUTH_BASE_URL` estiver
 * configurada, ou para a rota local `/auth/login` como fallback.
 *
 * @route GET /login
 * @param req - Requisição HTTP.
 * @param res - Resposta HTTP com redirecionamento para o destino calculado.
 */
router.get('/login', (req:Request, res:Response) =>{

    const destino = AUTH_BASE_URL ? '${AUTH_BASE_URL}/login' : '/auth/login';
    res.redirect(destino);
});

// Rota GET /cadastro: redireciona para o serviço externo de cadastro (se configurado)
// ou para a rota local /auth/cadastro como fallback
/**
 * Redireciona para o serviço externo de cadastro, se `AUTH_BASE_URL` estiver
 * configurada, ou para a rota local `/auth/cadastro` como fallback.
 *
 * @route GET /cadastro
 * @param req - Requisição HTTP.
 * @param res - Resposta HTTP com redirecionamento para o destino calculado.
 */
router.get('/cadastro', (req:Request, res:Response) =>{
    const destino = AUTH_BASE_URL ? '${AUTH_BASE_URL}/login' : '/auth/cadastro';
    res.redirect(destino);
});

/// Rota GET /register: apenas um alias em inglês que redireciona para /cadastro
/**
 * Alias em inglês que redireciona para `/cadastro`.
 *
 * @route GET /register
 * @param req - Requisição HTTP.
 * @param res - Resposta HTTP com redirecionamento para `/cadastro`.
 */
router.get('/register', (req:Request, res:Response) =>{
    res.redirect('/cadastro');
});

// Rota POST /registro: recebe os dados de cadastro do usuário
/**
 * Recebe os dados de cadastro do usuário.
 *
 * @route POST /registro
 * @param req - Requisição HTTP contendo `nome`, `email` e `senha` no corpo.
 * @param res - Resposta HTTP com redirecionamento para `/login`.
 *
 * @remarks
 * TODO: aqui deveria entrar a lógica real de criação do usuário
 * (validação dos campos, hash da senha, persistência no banco, etc.).
 */
router.post('/registro', (req: Request, res: Response) => {

    const { nome, email, senha } = req.body;
    // TODO: aqui deveria entrar a lógica real de criação do usuário
    // (validação dos campos, hash da senha, persistência no banco, etc.)
    console.log(nome, email, senha);

    res.redirect('/login');
});

// Exporta o router para ser montado na aplicação principal
/**
 * Router de autenticação, a ser montado na aplicação principal.
 */
export default router;
