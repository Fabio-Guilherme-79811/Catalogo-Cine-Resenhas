import {Router} from 'express';
import landingRoutes from './landing-routes';
import authRoutes from './auth-routes';
import adminRoutes from './admin-routes';
import userRoutes from './user-routes';
import conteudoRoutes from './conteudo-routes';
import configRoutes from './config-routes';
import avaliacaoRoutes from './avaliacao-routes';

// Router principal que agrega (monta) todas as sub-rotas da aplicação
const router = Router();

router.use('/', landingRoutes);// Rotas da landing page (ex: /, /login, /register) montadas na raiz
router.use('/', authRoutes);// Rotas de autenticação (ex: login, logout, refresh token) também montadas na raiz
router.use('/admin', adminRoutes);// Rotas administrativas, prefixadas com /admin
router.use('/usuario', userRoutes);// Rotas relacionadas ao usuário, prefixadas com /usuario
router.use('/conteudo', conteudoRoutes);// Rotas relacionadas a conteúdo, prefixadas com /conteudo
router.use('/config', configRoutes);// Rotas de configuração, prefixadas com /config
router.use('/avaliacoes', avaliacaoRoutes);// Rotas de avaliações, prefixadas com /avaliacoes
// Exporta o router principal para ser utilizado no arquivo principal da aplicação (app/server)
export default router;