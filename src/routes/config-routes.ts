import { Router, Request, Response } from 'express';
import { isAuthenticated, isAdmin, AuthenticatedRequest } from '../middlewares/auth-middleware';

const router = Router();
/**
 * Objeto de configuração da aplicação, mantido em memória.
 *
 * @remarks
 * Por estar em memória, essas alterações se perdem quando o servidor
 * reinicia. O ideal seria persistir isso em banco de dados ou arquivo
 * de configuração.
 */
const config = {
  nomeSite: 'Cine-resenhas',
  descricao: 'Sua resenha é a nossa também!',
  corPrimaria: '#e54646',
  modoManutencao: false,
  emailSuporte: 'suporte@exemplo.com',
};

/**
 * Retorna apenas os dados públicos da configuração, sem exigir
 * autenticação (dados seguros para expor a qualquer visitante).
 *
 * @route GET /
 * @param req - Requisição HTTP.
 * @param res - Resposta HTTP contendo `nomeSite`, `descricao`, `corPrimaria`
 * e `modoManutencao`.
 */
router.get('/', (req: Request, res: Response) => {
  const { nomeSite, descricao, corPrimaria, modoManutencao } = config;
  res.json({ nomeSite, descricao, corPrimaria, modoManutencao });
});

/**
 * Retorna TODA a configuração, incluindo dados sensíveis (como o
 * e-mail de suporte). Acessível apenas para administradores autenticados.
 *
 * @route GET /completo
 * @param req - Requisição autenticada, restrita a administradores.
 * @param res - Resposta HTTP com o objeto `config` completo.
 */
router.get('/completo', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json(config);
});

/**
 * Atualiza a configuração com os dados enviados no corpo da requisição,
 * mesclando (via `Object.assign`) os campos recebidos com a configuração
 * atual. Restrita a administradores autenticados.
 *
 * @route PUT /
 * @param req - Requisição autenticada contendo os campos a atualizar em `req.body`.
 * @param res - Resposta HTTP com mensagem de confirmação e a configuração atualizada.
 *
 * @remarks
 * **ATENÇÃO**: não há validação dos campos recebidos em `atualizacoes` —
 * isso permite que campos inválidos/inesperados sejam injetados no objeto
 * de config. Idealmente, validar/whitelistar os campos antes de aplicar
 * o `Object.assign`.
 */
router.put('/', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
  const atualizacoes = req.body;

  Object.assign(config, atualizacoes);

  res.json({ mensagem: 'Configurações atualizadas com sucesso.', config });
});

/**
 * Liga/desliga o modo de manutenção do site. Restrita a administradores
 * autenticados.
 *
 * @route PUT /manutencao
 * @param req - Requisição autenticada contendo o campo `ativo` (booleano) em `req.body`.
 * @param res - Resposta HTTP: erro 400 se `ativo` não for um booleano,
 * ou mensagem de confirmação indicando o novo estado do modo de manutenção.
 */
router.put('/manutencao', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { ativo } = req.body;
  /** Validação: o campo "ativo" precisa ser um booleano explícito */
  if (typeof ativo !== 'boolean') {
    res.status(400).json({ mensagem: 'Informe o campo "ativo" como true ou false.' });
    return;
  }

  config.modoManutencao = ativo;
  res.json({ mensagem: `Modo de manutenção ${ativo ? 'ativado' : 'desativado'}.` });
});
/**
 * Router de configuração, a ser montado na rota `/config` da aplicação principal.
 */
export default router;
