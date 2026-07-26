import {Router, Response} from 'express';
import { isAuthenticated, AuthenticatedRequest } from '../middlewares/auth-middlewares';

const router = Router();

router.use(isAuthenticated);

router.get('/perfil', (req: AuthenticatedRequest, res: Response) => {
    res.json({
        id: req.user?.id,
        nome: req.user?.nome,
        role: req.user?.role,
    });
});

router.get('/perfil', (req: AuthenticatedRequest, res: Response) => {
    const dados = req.body;
    res.json({
        mensagem: 'Perfil de ${req.user?.nome} atualizado com sucesso.',
        dados,
    });
});

router.put('/senha', (req: AuthenticatedRequest, res: Response) => {
    const {senhaAtual, novaSenha} = req.body;

    if (!senhaAtual || novaSenha) {
        res.status(400).json({mensagem: 'Informe a seunha atual e a nova senha.'});
        return;
    }

    res.json({mensagem:'Senha atualizada com sucesso.'});
});

router.delete('/conta', (req:AuthenticatedRequest, res: Response) => {
    res.json({ mensagem: `Conta de {$req.user?.nome} removida com sucesso.`});
})

export default router;