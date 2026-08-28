import { Router } from 'express';
import paginasRoutes from './paginas-routes';
import landingRoutes from './landing-routes';
import authRoutes from './auth-routes';
import adminRoutes from './admin-routes';
import userRoutes from './user-routes';
import conteudoRoutes from './conteudo-routes';
import configRoutes from './config-routes';
import avaliacaoRoutes from './avaliacao-routes';
import favoritoRoutes from './favorito-routes';

/**
 * Router principal da aplicação
 *
 * Agrega (monta) todas as sub-rotas dos diferentes módulos em seus
 * respectivos prefixos, centralizando o roteamento em um único ponto
 * de entrada a ser utilizado pelo servidor da aplicação
 *
 * @remarks
 * A ordem de montagem importa apenas em casos de conflito de rotas
 * (ex: middlewares aplicados na raiz que afetam rotas subsequentes)
 */

const router = Router();

// Router principal que agrega (monta) todas as sub-rotas da aplicação

/**
 * Rotas de páginas (views EJS: `/login`, `/cadastro`, `/catalogo`,
 * `/filmes/:id`, `/painel-admin`...), montadas na raiz.
 *
 * @remarks
 * Precisa ser montado ANTES de `landingRoutes`/`authRoutes`: como o
 * Express usa o primeiro handler que casar com a rota, se essas rotas
 * fossem montadas depois, os handlers de `/login`/`/register` que ainda
 * restam em `landingRoutes`/`authRoutes` (apenas redirecionamentos)
 * seriam executados no lugar da renderização da página.
 *
 * @see {@link paginasRoutes}
 */
router.use('/', paginasRoutes);

/**
 * Rotas da landing page (ex: `/`), montadas na raiz.
 * @see {@link landingRoutes}
 */
router.use('/', landingRoutes);

/**
 *Rotas de autentificação (ex: login, logout, refresh token) também montadas na raiz
 @see{@link authRoutes}
 */
router.use('/', authRoutes);

/**
 * Rotas administrativas, prefixadas com `/admin`.
 * @see {@link adminRoutes}
 */
router.use('/admin', adminRoutes);

/**
 * Rotas relacionadas ao usuário, prefixadas com `/usuario`.
 * @see {@link userRoutes}
 */
router.use('/usuario', userRoutes);

/**
 * Rotas relacionadas a conteúdo, prefixadas com `/conteudo`.
 * @see {@link conteudoRoutes}
 */
router.use('/conteudo', conteudoRoutes);

/**
 * Rotas de configuração, prefixadas com `/config`.
 * @see {@link configRoutes}
 */
router.use('/config', configRoutes);

/**
 * Rotas de avaliação, prefixadas com  `/avaliacoes`.
 * @see {@link avaliacaoRoutes}
 */
router.use('/avaliacoes', avaliacaoRoutes);

/**
 * Rotas de favoritos, prefixadas com `/favoritos`.
 * @see {@link favoritoRoutes}
 */
router.use('/favoritos', favoritoRoutes);

/**
 * Router principal exportado, pronto para ser montado no arquivo
 * principal da aplicação (ex `app.ts` ou `server.ts`).
 */

// Exporta o router principal para ser utilizado no arquivo principal da aplicação (app/server)
export default router;
