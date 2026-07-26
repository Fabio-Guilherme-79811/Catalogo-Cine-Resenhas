import { Router, Response } from "express";
import {isAuthenticated, isAdmin, AuthenticatedRequest} from '../middlewares/auth-middlewares';

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get('/', (req: AuthenticatedRequest, res: Response) =>{
    res.json({
        mensagem: 'Bem-vindo ao portal administrativo, ${req.user?.nome}',
        secoes: ['usuario', 'estatisticas', 'configuracoes'],
    });
});

router.get('/usuarios', (req: AuthenticatedRequest, res: Response) => {
    const usuarios = [
        {id: '1', nome: 'Sujiro da Silva', email:'sujirokimimame@exemplo.com', role:'usuario'},
        {id: '2', nome: 'Aziz Ab', email: 'baphometazizabsaber@exemplo.com', role: 'admin'},
    ];
    res.json(usuarios);
});

router.get('/usuarios', (req: AuthenticatedRequest, res: Response) => {
    const {id} = req.params;
    res.json({id, nome: 'Usuário exemplo',email: 'exemplo@exemplo.com', role:'usuario' });
});

router.put('./usuarios/:id', (req:AuthenticatedRequest, res: Response) => {
    const {id} = req.params;
    const dados = req.body;
    res.json({ mensagem: `Usuário ${id} atualizado com sucesso.`, dados});
});

router.delete('/usuario/:id', (req: AuthenticatedRequest, res: Response) => {
    const {id} = req.params;
    res.json({ mensagem:`Usuário ${id} removido com sucesso.`});
});

router.get('/estatisticas', (req: AuthenticatedRequest, res: Response) => {
    res.json({
        totalUsuario:128,
        novosCadastrosSemana:14,
        visitasLandingPage:3520,
    });
});

export default router;