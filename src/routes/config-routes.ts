import { Router, Request, Response } from 'express';
import { isAuthenticated, isAdmin, AuthenticatedRequest } from '../middlewares/auth-middlewares';

const router = Router();

const config = {
    nomeSite: 'Cine-resenhas',
    descricao: 'Sua resenha é a nossa também!',
    corPrimaria: '#e54646',
    modoManutencao: false,
    emailSuporte: 'suporte@exemplo.com',
};

router.get('/', (req: Request, res: Response) => {
    const { nomeSite, descricao, corPrimaria, modoManutencao } = config;
    res.json({ nomeSite, descricao, corPrimaria, modoManutencao });
});

router.get('/completo', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
    res.json(config);
});

router.put('/', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
    const atualizacoes = req.body;

    Object.assign(config, atualizacoes);

    res.json({ mensagem: 'Configurações atualizadas com sucesso.', config });
});

router.put('/manutencao', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { ativo } = req.body;

    if (typeof ativo !== 'boolean') {
        res.status(400).json({ mensagem: 'Informe o campo "ativo" como true ou false.' });
        return;
    }

    config.modoManutencao = ativo;
    res.json({ mensagem: `Modo de manutenção ${ativo ? 'ativado' : 'desativado'}.` });
});

export default router;