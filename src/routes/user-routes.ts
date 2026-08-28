import { Router, Response } from 'express';
import { isAuthenticated, AuthenticatedRequest } from '../middlewares/auth-middleware';

const router = Router();

// Todas as rotas abaixo exigem autenticação
router.use(isAuthenticated);

/**
 * Retorna os dados do perfil do usuário autenticado
 *
 * @route GET /perfil
 * @param req - requisição autenticada, contendo os dados do usuário em `req.user`.
 * @param res - Resposta HTTP com o objeto  `{ id, nome, role }` do usuário logado
 */
router.get('/perfil', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    id: req.user?.id,
    nome: req.user?.nome,
    role: req.user?.role,
  });
});

/**
 * Atualiza os dados do perfil do usuário autenticado
 *
 * @route PUT /perfil
 * @param req - Requisição autenticada contendo os dados a atualizar em `req.body`.
 * @param res - Resposta HTTP com mensagem de confirmação e os dados enviados.
 */
router.put('/perfil', (req: AuthenticatedRequest, res: Response) => {
  const dados = req.body;
  res.json({
    mensagem: `Perfil de ${req.user?.nome} atualizado com sucesso.`,
    dados,
  });
});

/**
 * Permite que  usuário autenticado altere sua senha
 *
 * @route PUT/senha
 * @param req - Requisição autenticada contendo `senhaAtual` e `novaSenha` no corpo.
 * @param res - Resposta HTTP: erro 400 se os dados obrigatorios forem informados,
 * ou mensagem de sucesso caso a senha seja atualizada
 */
// Permite alterar a senha do usuário
router.put('/senha', (req: AuthenticatedRequest, res: Response) => {
  const { senhaAtual, novaSenha } = req.body;

  if (!senhaAtual || !novaSenha) {
    res.status(400).json({ mensagem: 'Informe a senha atual e a nova senha.' });
    return;
  }

  res.json({ mensagem: 'Senha atualizada com sucesso.' });
});

/**
 * Remove a conta do usuário autenticado
 *
 * @route DELETE/conta
 * @param req - Requisição autenticada contendo os dados do usuário em `req.user`.
 * @param res - Resposta HTTP com mensagem de confimação da remoç
 */
// Remove a conta do usuário autenticado
router.delete('/conta', (req: AuthenticatedRequest, res: Response) => {
  res.json({ mensagem: `Conta de ${req.user?.nome} removida com sucesso.` });
});

export default router;
