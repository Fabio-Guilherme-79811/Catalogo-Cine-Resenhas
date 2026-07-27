import {Router} from 'express';
import landingRoutes from './landing-routes';
import authRoutes from './auth-routes';
import adminRoutes from './admin-routes';
import userRoutes from './user-routes';
import conteudoRoutes from './conteudo-routes';
import configRoutes from './config-routes';

const router = Router();

router.use('/', landingRoutes);
router.use('/', authRoutes);
router.use('/admin', adminRoutes);
router.use('/usuario', userRoutes);
router.use('/conteudo', conteudoRoutes);
router.use('/config', configRoutes);

export default router;