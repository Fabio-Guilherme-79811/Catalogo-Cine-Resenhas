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

// As rotas GET /login, GET /cadastro e GET /register que existiam aqui
// foram removidas: a renderização dessas páginas agora é responsabilidade
// exclusiva de `paginas-routes.ts` (ver GET /login e GET /cadastro lá),
// para não haver dois handlers concorrendo pelo mesmo caminho. Este
// router fica só com as rotas que efetivamente processam autenticação
// (ex: POST /registro abaixo). AUTH_BASE_URL permanece disponível caso
// a lógica de submissão do formulário precise delegar para um serviço
// externo de autenticação.

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
