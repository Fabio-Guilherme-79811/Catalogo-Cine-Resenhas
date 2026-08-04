import { Router, Request, Response } from 'express';
import { isAuthenticated, isAdmin, AuthenticatedRequest } from '../middlewares/auth-middleware';
import { filmes } from './conteudo-routes';

/**
 * Router responsável exclusivamente por renderizar as páginas (views EJS)
 * da aplicação.
 *
 * @remarks
 * Diferente dos demais routers (ex: `conteudo-routes`, `avaliacao-routes`,
 * `admin-routes`), que expõem uma API JSON, este router cuida apenas de
 * páginas HTML renderizadas no servidor com EJS. Mantê-lo separado deixa
 * claro, ao montar as rotas em `index-routes.ts`, quais endpoints devolvem
 * HTML (para o usuário navegar) e quais devolvem dados (para o front-end
 * consumir via fetch).
 */
const router = Router();

/**
 * GET /login
 * Renderiza a página de login.
 *
 * @route GET /login
 */
router.get('/login', (_req: Request, res: Response) => {
  res.render('pages/login', { title: 'Entrar' });
});

/**
 * GET /cadastro
 * Renderiza a página de cadastro de novos usuários.
 *
 * @route GET /cadastro
 */
router.get('/cadastro', (_req: Request, res: Response) => {
  res.render('pages/registro', { title: 'Cadastrar' });
});

/**
 * GET /catalogo
 * Renderiza a página do catálogo com os filmes publicados.
 * Suporta filtro opcional por gênero via query string (?genero=Drama).
 *
 * @route GET /catalogo
 */
router.get('/catalogo', (req: Request, res: Response) => {
  const { genero } = req.query;

  let resultado = filmes.filter((f) => f.publicado);
  if (genero) {
    resultado = resultado.filter(
      (f) => f.genero.toLowerCase() === String(genero).toLowerCase()
    );
  }

  res.render('pages/catalogo', { title: 'Catálogo', filmes: resultado });
});

/**
 * GET /filmes/:id
 * Renderiza a página de detalhes de um filme específico do catálogo.
 *
 * @route GET /filmes/:id
 */
router.get('/filmes/:id', (req: Request, res: Response) => {
  const filme = filmes.find((f) => f.id === req.params.id && f.publicado);

  if (!filme) {
    res.status(404).render('errors/404', { title: 'Filme não encontrado' });
    return;
  }

  res.render('pages/detalhes', { title: filme.titulo, filme });
});

/**
 * GET /painel-admin
 * Renderiza o painel administrativo. Restrito a administradores autenticados.
 *
 * @remarks
 * Usa o prefixo `/painel-admin` (em vez de `/admin`) para não colidir com
 * as rotas de API montadas em `/admin` (ver `admin-routes.ts`).
 *
 * @route GET /painel-admin
 */
router.get(
  '/painel-admin',
  isAuthenticated,
  isAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    res.render('pages/admin-dashboard', {
      title: 'Painel Administrativo',
      usuario: req.user,
    });
  }
);

/**
 * GET /painel-admin/filmes/novo
 * Renderiza o formulário de cadastro de um novo filme.
 * Restrito a administradores autenticados.
 *
 * @route GET /painel-admin/filmes/novo
 */
router.get(
  '/painel-admin/filmes/novo',
  isAuthenticated,
  isAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    res.render('pages/admin-filme-form', {
      title: 'Novo Filme',
      filme: null,
      usuario: req.user,
    });
  }
);

/**
 * GET /painel-admin/filmes/:id/editar
 * Renderiza o formulário de edição de um filme existente.
 * Restrito a administradores autenticados.
 *
 * @route GET /painel-admin/filmes/:id/editar
 */
router.get(
  '/painel-admin/filmes/:id/editar',
  isAuthenticated,
  isAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const filme = filmes.find((f) => f.id === req.params.id);

    if (!filme) {
      res.status(404).render('errors/404', { title: 'Filme não encontrado' });
      return;
    }

    res.render('pages/admin-filme-form', {
      title: 'Editar Filme',
      filme,
      usuario: req.user,
    });
  }
);

/**
 * Router de páginas, a ser montado na raiz (`/`) da aplicação principal,
 * antes das demais rotas que também respondem em `/login`, `/register`,
 * etc. (ver observação em `index-routes.ts`).
 */
export default router;
