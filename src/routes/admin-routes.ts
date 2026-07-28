import { Router, Response } from "express";
import {isAuthenticated, isAdmin, AuthenticatedRequest} from '../middlewares/auth-middleware';

const router = Router();
// Aplica os middlewares de autenticação e verificação de admin
// para TODAS as rotas deste router (área administrativa)
router.use(isAuthenticated, isAdmin);
// Rota GET /: retorna uma mensagem de boas-vindas e as seções disponíveis do painel
router.get('/', (req: AuthenticatedRequest, res: Response) =>{
    res.json({
        mensagem: 'Bem-vindo ao portal administrativo, ${req.user?.nome}',
        secoes: ['usuario', 'estatisticas', 'configuracoes'],
    });
});
// Rota GET /usuarios: lista todos os usuários (dados mockados/estáticos)
router.get('/usuarios', (req: AuthenticatedRequest, res: Response) => {
    const usuarios = [
        {id: '1', nome: 'Sujiro da Silva', email:'sujirokimimame@exemplo.com', role:'usuario'},
        {id: '2', nome: 'Aziz Ab', email: 'baphometazizabsaber@exemplo.com', role: 'admin'},
    ];
    res.json(usuarios);
});
// Rota GET /usuarios: (deveria ser detalhe de um usuário específico por :id,
// mas o path está duplicado e sem parâmetro — ver observação abaixo)
router.get('/usuarios', (req: AuthenticatedRequest, res: Response) => {
    const {id} = req.params;
    res.json({id, nome: 'Usuário exemplo',email: 'exemplo@exemplo.com', role:'usuario' });
});
// Rota PUT para atualizar um usuário específico pelo id
router.put('./usuarios/:id', (req:AuthenticatedRequest, res: Response) => {
    const {id} = req.params;
    const dados = req.body;
    res.json({ mensagem: `Usuário ${id} atualizado com sucesso.`, dados});
});
// Rota DELETE para remover um usuário específico pelo id
router.delete('/usuario/:id', (req: AuthenticatedRequest, res: Response) => {
    const {id} = req.params;
    res.json({ mensagem:`Usuário ${id} removido com sucesso.`});
});
// Rota GET /estatisticas: retorna métricas gerais do sistema (dados mockados/estáticos)
router.get('/estatisticas', (req: AuthenticatedRequest, res: Response) => {
    res.json({
        totalUsuario:128,
        novosCadastrosSemana:14,
        visitasLandingPage:3520,
    });
});
// Exporta o router para ser montado na rota /admin da aplicação principal
export default router;