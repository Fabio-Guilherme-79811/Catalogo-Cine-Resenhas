import { Router, Response } from "express";
import {isAuthenticated, isAdmin, AuthenticatedRequest} from '../middlewares/auth-middleware';

const router = Router();
// Aplica os middlewares de autenticação e verificação de admin
// para TODAS as rotas deste router (área administrativa)
/**
 * Middlewares aplicados a todas as rotas deste router (área administrativa):
 * exige usuário autenticado e com role de administrador.
 */
router.use(isAuthenticated, isAdmin);

// Rota GET /: retorna uma mensagem de boas-vindas e as seções disponíveis do painel
/**
 * Retorna uma mensagem de boas-vindas e as seções disponíveis do painel administrativo.
 *
 * @route GET /
 * @param req - Requisição autenticada, restrita a administradores.
 * @param res - Resposta HTTP com mensagem de boas-vindas e lista de seções.
 */
router.get('/', (req: AuthenticatedRequest, res: Response) =>{
    res.json({
        mensagem: 'Bem-vindo ao portal administrativo, ${req.user?.nome}',
        secoes: ['usuario', 'estatisticas', 'configuracoes'],
    });
});

// Rota GET /usuarios: lista todos os usuários (dados mockados/estáticos)
/**
 * Lista todos os usuários (dados mockados/estáticos).
 *
 * @route GET /usuarios
 * @param req - Requisição autenticada, restrita a administradores.
 * @param res - Resposta HTTP com o array de usuários.
 */
router.get('/usuarios', (req: AuthenticatedRequest, res: Response) => {
    const usuarios = [
        {id: '1', nome: 'Sujiro da Silva', email:'sujirokimimame@exemplo.com', role:'usuario'},
        {id: '2', nome: 'Aziz Ab', email: 'baphometazizabsaber@exemplo.com', role: 'admin'},
    ];
    res.json(usuarios);
});

// Rota GET /usuarios: (deveria ser detalhe de um usuário específico por :id,
// mas o path está duplicado e sem parâmetro — ver observação abaixo)
/**
 * Retorna o detalhe de um usuário específico (dado mockado/estático).
 *
 * @route GET /usuarios
 * @param req - Requisição autenticada, restrita a administradores.
 * @param res - Resposta HTTP com os dados do usuário.
 *
 * @remarks
 * O path desta rota está duplicado em relação à rota `GET /usuarios` acima
 * e não possui o parâmetro `:id` (ex: deveria ser `/usuarios/:id`). Como
 * está, `req.params.id` sempre será `undefined`.
 */
router.get('/usuarios', (req: AuthenticatedRequest, res: Response) => {
    const {id} = req.params;
    res.json({id, nome: 'Usuário exemplo',email: 'exemplo@exemplo.com', role:'usuario' });
});

// Rota PUT para atualizar um usuário específico pelo id
/**
 * Atualiza um usuário específico pelo id.
 *
 * @route PUT ./usuarios/:id
 * @param req - Requisição autenticada contendo `id` nos parâmetros da rota
 * e os dados a atualizar em `req.body`.
 * @param res - Resposta HTTP com mensagem de confirmação e os dados atualizados.
 *
 * @remarks
 * O path `'./usuarios/:id'` começa com `./`, o que é incomum em rotas Express
 * (o esperado seria `/usuarios/:id`).
 */
router.put('./usuarios/:id', (req:AuthenticatedRequest, res: Response) => {
    const {id} = req.params;
    const dados = req.body;
    res.json({ mensagem: `Usuário ${id} atualizado com sucesso.`, dados});
});

// Rota DELETE para remover um usuário específico pelo id
/**
 * Remove um usuário específico pelo id.
 *
 * @route DELETE /usuario/:id
 * @param req - Requisição autenticada contendo `id` nos parâmetros da rota.
 * @param res - Resposta HTTP com mensagem de confirmação da remoção.
 */
router.delete('/usuario/:id', (req: AuthenticatedRequest, res: Response) => {
    const {id} = req.params;
    res.json({ mensagem:`Usuário ${id} removido com sucesso.`});
});

// Rota GET /estatisticas: retorna métricas gerais do sistema (dados mockados/estáticos)
/**
 * Retorna métricas gerais do sistema (dados mockados/estáticos).
 *
 * @route GET /estatisticas
 * @param req - Requisição autenticada, restrita a administradores.
 * @param res - Resposta HTTP com `totalUsuario`, `novosCadastrosSemana` e `visitasLandingPage`.
 */
router.get('/estatisticas', (req: AuthenticatedRequest, res: Response) => {
    res.json({
        totalUsuario:128,
        novosCadastrosSemana:14,
        visitasLandingPage:3520,
    });
});

// Exporta o router para ser montado na rota /admin da aplicação principal
/**
 * Router administrativo, a ser montado na rota `/admin` da aplicação principal.
 */
export default router;