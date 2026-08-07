import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../entities/Usuario';
import { UsuarioRepository } from '../models/UsuarioRepository';
import { AUTH_COOKIE_NAME, JWT_SECRET, UsuarioTokenPayload } from '../middlewares/auth-middleware';

const router = Router();
const usuarioRepository = new UsuarioRepository();

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
// (login, registro e logout). AUTH_BASE_URL permanece disponível caso
// a lógica de submissão do formulário precise delegar para um serviço
// externo de autenticação.

/**
 * Gera o cookie de sessão (JWT) para um usuário autenticado.
 */
function definirCookieSessao(res: Response, payload: UsuarioTokenPayload): void {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

    res.cookie(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 2 * 60 * 60 * 1000, // 2h, em ms — precisa bater com o expiresIn acima
    });
}

// Rota POST /entrar: autentica o usuário (login)
/**
 * Autentica um usuário existente e inicia sua sessão.
 *
 * @route POST /entrar
 * @param req - Requisição HTTP contendo `email` e `senha` no corpo.
 * @param res - Redireciona para `/painel-admin` (admin) ou `/catalogo` (comum)
 * em caso de sucesso; re-renderiza `/login` com mensagem de erro caso contrário.
 */
router.post('/entrar', async (req: Request, res: Response) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        res.status(400).render('pages/login', {
            title: 'Entrar',
            erro: 'Informe e-mail e senha.',
        });
        return;
    }

    try {
        const usuario = await usuarioRepository.buscarPorEmail(email);

        // Mensagem genérica de propósito: não revela se o e-mail existe ou não
        if (!usuario) {
            res.status(401).render('pages/login', {
                title: 'Entrar',
                erro: 'E-mail ou senha inválidos.',
            });
            return;
        }

        const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);
        if (!senhaConfere) {
            res.status(401).render('pages/login', {
                title: 'Entrar',
                erro: 'E-mail ou senha inválidos.',
            });
            return;
        }

        definirCookieSessao(res, {
            id: usuario.id,
            nome: usuario.nome,
            role: usuario.role,
        });

        res.redirect(usuario.role === 'admin' ? '/painel-admin' : '/catalogo');
    } catch (erro) {
        console.error('Erro ao autenticar usuário:', erro);
        res.status(500).render('pages/login', {
            title: 'Entrar',
            erro: 'Não foi possível entrar agora. Tente novamente.',
        });
    }
});

// Rota POST /registro: recebe os dados de cadastro do usuário e cria a conta
/**
 * Recebe os dados de cadastro do usuário, cria a conta (com hash de senha
 * via bcrypt) e já inicia a sessão automaticamente.
 *
 * @route POST /registro
 * @param req - Requisição HTTP contendo `nome`, `email`, `senha` e
 * `confirmarSenha` no corpo.
 * @param res - Resposta HTTP com redirecionamento para `/catalogo` em caso
 * de sucesso, ou re-renderização de `/cadastro` com mensagem de erro.
 */
router.post('/registro', async (req: Request, res: Response) => {
    const { nome, email, senha, confirmarSenha } = req.body;

    if (senha !== confirmarSenha) {
        res.status(400).render('pages/registro', {
            title: 'Cadastrar',
            erro: 'As senhas informadas não conferem.',
        });
        return;
    }

    try {
        Usuario.validarSenhaPlana(senha); // RNLF02 - valida antes de gerar o hash

        const senhaHash = await bcrypt.hash(senha, 10);
        const novoUsuario = new Usuario({
            id: '', // gerado pelo repositório (randomUUID) em criar()
            nome,
            email,
            senhaHash,
        });

        const usuarioCriado = await usuarioRepository.criar(novoUsuario);

        definirCookieSessao(res, {
            id: usuarioCriado.id,
            nome: usuarioCriado.nome,
            role: usuarioCriado.role,
        });

        res.redirect('/catalogo');
    } catch (erro) {
        // Cobre tanto validações da entidade (nome/e-mail/senha inválidos)
        // quanto o RNLF01 (e-mail já cadastrado), lançados pelo repositório
        const mensagem = erro instanceof Error ? erro.message : 'Não foi possível concluir o cadastro.';
        res.status(400).render('pages/registro', {
            title: 'Cadastrar',
            erro: mensagem,
        });
    }
});

// Rota POST /logout: encerra a sessão do usuário
/**
 * Encerra a sessão do usuário autenticado, removendo o cookie de sessão.
 *
 * @route POST /logout
 * @param _req - Requisição HTTP.
 * @param res - Resposta HTTP com redirecionamento para `/login`.
 */
router.post('/logout', (_req: Request, res: Response) => {
    res.clearCookie(AUTH_COOKIE_NAME);
    res.redirect('/login');
});

// Exporta o router para ser montado na aplicação principal
/**
 * Router de autenticação, a ser montado na aplicação principal.
 */
export default router;
