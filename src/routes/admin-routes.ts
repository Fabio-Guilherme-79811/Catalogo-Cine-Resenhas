import { Router, Response } from 'express';
import { isAuthenticated, isAdmin, AuthenticatedRequest } from '../middlewares/auth-middleware';
import { UsuarioRepository } from '../models/UsuarioRepository';
import { Usuario } from '../entities/Usuario';
import { VisitaRepository } from '../models/VisitaRepository';

const router = Router();
const usuarioRepository = new UsuarioRepository();
const visitaRepository = new VisitaRepository();

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
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    mensagem: `Bem-vindo ao portal administrativo, ${req.user?.nome}`,
    secoes: ['usuario', 'estatisticas', 'configuracoes'],
  });
});

// Rota GET /usuarios: lista todos os usuários cadastrados (dados reais, via UsuarioRepository)
/**
 * Lista todos os usuários cadastrados no sistema.
 *
 * @route GET /usuarios
 * @param req - Requisição autenticada, restrita a administradores.
 * @param res - Resposta HTTP com o array de usuários (sem o hash de senha, RNLF03).
 */
router.get('/usuarios', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const usuarios = await usuarioRepository.listarTodos();
    res.json(usuarios.map((usuario) => usuario.toPublicJSON()));
  } catch (erro) {
    console.error('Erro ao listar usuários:', erro);
    res.status(500).json({ mensagem: 'Não foi possível listar os usuários.' });
  }
});

// Rota GET /usuarios/:id: retorna o detalhe de um usuário específico
/**
 * Retorna o detalhe de um usuário específico.
 *
 * @route GET /usuarios/:id
 * @param req - Requisição autenticada, restrita a administradores.
 * @param res - Resposta HTTP com os dados do usuário.
 */
router.get('/usuarios/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const usuario = await usuarioRepository.buscarPorId(id);

    if (!usuario) {
      res.status(404).json({ mensagem: `Usuário ${id} não encontrado.` });
      return;
    }

    res.json(usuario.toPublicJSON());
  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
    res.status(500).json({ mensagem: 'Não foi possível buscar o usuário.' });
  }
});

// Rota PUT para atualizar um usuário específico pelo id
/**
 * Atualiza um usuário específico pelo id (nome, e-mail e/ou papel).
 *
 * @route PUT /usuarios/:id
 * @param req - Requisição autenticada contendo `id` nos parâmetros da rota
 * e os dados a atualizar em `req.body` (`nome`, `email`, `role`).
 * @param res - Resposta HTTP com mensagem de confirmação e os dados atualizados.
 */
router.put('/usuarios/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const usuarioExistente = await usuarioRepository.buscarPorId(id);

    if (!usuarioExistente) {
      res.status(404).json({ mensagem: `Usuário ${id} não encontrado.` });
      return;
    }

    const dados = req.body ?? {};
    const usuarioAtualizado = new Usuario({
      id: usuarioExistente.id,
      nome: dados.nome ?? usuarioExistente.nome,
      email: dados.email ?? usuarioExistente.email,
      senhaHash: usuarioExistente.senhaHash,
      role: dados.role ?? usuarioExistente.role,
      criadoEm: usuarioExistente.criadoEm,
    });

    const resultado = await usuarioRepository.atualizar(id, usuarioAtualizado);

    res.json({
      mensagem: `Usuário ${id} atualizado com sucesso.`,
      dados: resultado?.toPublicJSON(),
    });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Não foi possível atualizar o usuário.';
    res.status(400).json({ mensagem });
  }
});

// Rota DELETE para remover um usuário específico pelo id
/**
 * Remove um usuário específico pelo id.
 *
 * @route DELETE /usuario/:id
 * @param req - Requisição autenticada contendo `id` nos parâmetros da rota.
 * @param res - Resposta HTTP com mensagem de confirmação da remoção.
 */
router.delete('/usuario/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const removido = await usuarioRepository.remover(id);

    if (!removido) {
      res.status(404).json({ mensagem: `Usuário ${id} não encontrado.` });
      return;
    }

    res.json({ mensagem: `Usuário ${id} removido com sucesso.` });
  } catch (erro) {
    console.error('Erro ao remover usuário:', erro);
    res.status(500).json({ mensagem: 'Não foi possível remover o usuário.' });
  }
});

// Rota GET /estatisticas: retorna métricas reais do sistema, calculadas a
// partir dos repositórios de usuários e de visitas.
/**
 * Retorna métricas gerais do sistema, calculadas a partir dos dados reais
 * persistidos (usuários cadastrados e visitas à landing page).
 *
 * @route GET /estatisticas
 * @param req - Requisição autenticada, restrita a administradores.
 * @param res - Resposta HTTP com `totalUsuario`, `novosCadastrosSemana` e `visitasLandingPage`.
 */
router.get('/estatisticas', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const usuarios = await usuarioRepository.listarTodos();
    const seteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const novosCadastrosSemana = usuarios.filter(
      (usuario) => new Date(usuario.criadoEm).getTime() >= seteDiasAtras,
    ).length;
    const visitasLandingPage = await visitaRepository.contarTotal();

    res.json({
      totalUsuario: usuarios.length,
      novosCadastrosSemana,
      visitasLandingPage,
    });
  } catch (erro) {
    console.error('Erro ao calcular estatísticas:', erro);
    res.status(500).json({ mensagem: 'Não foi possível calcular as estatísticas.' });
  }
});

// Exporta o router para ser montado na rota /admin da aplicação principal
/**
 * Router administrativo, a ser montado na rota `/admin` da aplicação principal.
 */
export default router;
