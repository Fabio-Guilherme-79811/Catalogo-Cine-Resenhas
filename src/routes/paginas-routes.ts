import { Router, Request, Response } from 'express';
import { isAuthenticated, isAdmin, AuthenticatedRequest } from '../middlewares/auth-middleware';
import { filmes } from './conteudo-routes';
import { UsuarioRepository } from '../models/UsuarioRepository';
import { AvaliacaoRepository } from '../models/AvaliacaoRepository';
import { FavoritoRepository } from '../models/FavoritoRepository';

const usuarioRepository = new UsuarioRepository();
const avaliacaoRepository = new AvaliacaoRepository();
const favoritoRepository = new FavoritoRepository();

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
 * Renderiza a página do catálogo com os filmes publicados, agrupados por gênero.
 * Suporta filtro opcional por gênero via query string (?genero=Drama).
 *
 * @route GET /catalogo
 */
router.get('/catalogo', (req: Request, res: Response) => {
  const { genero, busca } = req.query;

  let resultado = filmes.filter((f) => f.publicado);

  if (genero) {
    resultado = resultado.filter(
      (f) => f.genero.toLowerCase() === String(genero).toLowerCase()
    );
  }

<<<<<<< HEAD
  const generosUnicos = [...new Set(resultado.map((f) => f.genero))];
  const generos = generosUnicos.map((nome) => ({
    nome,
    filmes: resultado
      .filter((f) => f.genero === nome)
      .map((f) => ({
        id: f.id,
        titulo: f.titulo,
        anoLancamento: f.anoLancamento,
        capaUrl: f.posterUrl,
        avaliacao: 0, // TODO: substituir por avaliação real quando o módulo de avaliações existir
      })),
  }));

  res.render('pages/catalogo', { title: 'Catálogo', generos });
=======
  if (busca) {
    const termo = String(busca).trim().toLowerCase();
    resultado = resultado.filter(
      (f) =>
        f.titulo.toLowerCase().includes(termo) ||
        f.sinopse.toLowerCase().includes(termo)
    );
  }

  if (busca) {
    // Modo "resultado de busca": lista simples, sem agrupar por gênero
    // (ver catalogo.ejs, bloco `if (busca)`).
    res.render('pages/catalogo', {
      title: 'Catálogo',
      busca: String(busca),
      resultados: resultado,
    });
    return;
  }

  res.render('pages/catalogo', { title: 'Catálogo', filmes: resultado });
>>>>>>> e4c35194f894b5d01b2854ab33fac78d38dd63e9
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
      filmes,
      totalFilmes: filmes.length,
      // TODO: substituir por dados reais quando houver endpoint de estatísticas
      // ligado ao repositório de usuários (hoje `admin-routes.ts` só expõe
      // essas métricas mockadas em GET /admin/estatisticas).
      estatisticas: {
        totalUsuario: 0,
        novosCadastrosSemana: 0,
        visitasLandingPage: 0,
      },
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
 * GET /usuario/perfil
 * Renderiza a página de perfil do usuário autenticado, com seus dados
 * cadastrais e os filmes que ele favoritou.
 *
 * @remarks
 * O token JWT (`req.user`) só carrega `id`, `nome` e `role` — por isso é
 * necessário buscar o usuário completo no repositório para exibir campos
 * como e-mail e data de cadastro.
 *
 * @route GET /usuario/perfil
 */
router.get(
  '/usuario/perfil',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const usuarioCompleto = await usuarioRepository.buscarPorId(String(req.user?.id));

      if (!usuarioCompleto) {
        res.status(404).render('errors/404', { title: 'Usuário não encontrado' });
        return;
      }

      const favoritos = await favoritoRepository.listarPorUsuario(usuarioCompleto.id);
      const filmesFavoritos = filmes.filter((f) =>
        favoritos.some((fav) => fav.filmeId === f.id)
      );

      res.render('pages/perfil', {
        title: 'Meu perfil',
        usuario: req.user,
        perfil: usuarioCompleto.toPublicJSON(),
        filmesFavoritos,
      });
    } catch (erro) {
      console.error('Erro ao carregar perfil:', erro);
      res.status(500).render('errors/500', { title: 'Erro ao carregar perfil' });
    }
  }
);

/**
 * GET /usuario/avaliacoes
 * Renderiza a lista de avaliações feitas pelo usuário autenticado,
 * já combinadas com os dados do filme avaliado (título e capa).
 *
 * @route GET /usuario/avaliacoes
 */
router.get(
  '/usuario/avaliacoes',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const todasAvaliacoes = await avaliacaoRepository.listarTodas();
      const minhasAvaliacoes = todasAvaliacoes
        .filter((av) => av.usuarioId === String(req.user?.id))
        .sort((a, b) => (a.dataCriacao < b.dataCriacao ? 1 : -1))
        .map((av) => ({
          ...av.toJSON(),
          filme: filmes.find((f) => f.id === av.filmeId) ?? null,
        }));

      res.render('pages/avaliacoes', {
        title: 'Minhas avaliações',
        usuario: req.user,
        avaliacoes: minhasAvaliacoes,
      });
    } catch (erro) {
      console.error('Erro ao carregar avaliações:', erro);
      res.status(500).render('errors/500', { title: 'Erro ao carregar avaliações' });
    }
  }
);

/**
 * GET /usuario/historico
 * Renderiza a atividade recente do usuário autenticado.
 *
 * @remarks
 * O projeto ainda não possui uma entidade dedicada a "histórico de
 * visualização" (filmes assistidos/abertos). Até que ela exista, esta
 * página reaproveita as avaliações do usuário, ordenadas da mais recente
 * para a mais antiga, como uma linha do tempo de atividade.
 *
 * @route GET /usuario/historico
 */
router.get(
  '/usuario/historico',
  isAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const todasAvaliacoes = await avaliacaoRepository.listarTodas();
      const atividades = todasAvaliacoes
        .filter((av) => av.usuarioId === String(req.user?.id))
        .sort((a, b) => (a.dataCriacao < b.dataCriacao ? 1 : -1))
        .map((av) => ({
          ...av.toJSON(),
          filme: filmes.find((f) => f.id === av.filmeId) ?? null,
        }));

      res.render('pages/historico', {
        title: 'Histórico',
        usuario: req.user,
        atividades,
      });
    } catch (erro) {
      console.error('Erro ao carregar histórico:', erro);
      res.status(500).render('errors/500', { title: 'Erro ao carregar histórico' });
    }
  }
);

/**
 * GET /config
 * Renderiza a página de configurações do usuário autenticado.
 *
 * @remarks
 * Precisa ser definida aqui (e não em `config-routes.ts`) pelo mesmo
 * motivo do `/login`/`/cadastro`: como este router é montado na raiz
 * antes de `config-routes` (montado em `/config`), esta rota intercepta
 * o GET /config e devolve a página HTML em vez do JSON de configuração
 * pública que `config-routes.ts` devolveria.
 *
 * @route GET /config
 */
router.get(
  '/config',
  isAuthenticated,
  (req: AuthenticatedRequest, res: Response) => {
    res.render('pages/config', {
      title: 'Configurações',
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