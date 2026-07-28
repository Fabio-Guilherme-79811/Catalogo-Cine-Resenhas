import { Router, Request, Response } from 'express';
import { isAuthenticated, isAdmin, AuthenticatedRequest } from '../middlewares/auth-middleware';

const router = Router();
// Objeto de configuração da aplicação, mantido em memória
// OBS: por estar em memória, essas alterações se perdem quando o servidor reinicia
// (o ideal seria persistir isso em banco de dados ou arquivo de configuração)
const config = {
    nomeSite: 'Cine-resenhas',
    descricao: 'Sua resenha é a nossa também!',
    corPrimaria: '#e54646',
    modoManutencao: false,
    emailSuporte: 'suporte@exemplo.com',
};
// Rota GET /: retorna apenas os dados públicos da configuração,
// sem exigir autenticação (dados seguros para expor a qualquer visitante)
router.get('/', (req: Request, res: Response) => {
    const { nomeSite, descricao, corPrimaria, modoManutencao } = config;
    res.json({ nomeSite, descricao, corPrimaria, modoManutencao });
});
// Rota GET /completo: retorna TODA a configuração (incluindo dados sensíveis,
// como o e-mail de suporte), acessível apenas para administradores autenticados
router.get('/completo', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
    res.json(config);
});
// Rota PUT /: atualiza a configuração com os dados enviados no corpo da requisição,
// mesclando (Object.assign) os campos recebidos com a configuração atual.
// Restrita a administradores autenticados.
// ATENÇÃO: não há validação dos campos recebidos em "atualizacoes" — isso permite
// que campos inválidos/inesperados sejam injetados no objeto de config (idealmente
// validar/whitelistar os campos antes de aplicar o Object.assign)
router.put('/', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
    const atualizacoes = req.body;

    Object.assign(config, atualizacoes);

    res.json({ mensagem: 'Configurações atualizadas com sucesso.', config });
});
// Rota PUT /manutencao: liga/desliga o modo de manutenção do site.
// Restrita a administradores autenticados.
router.put('/manutencao', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { ativo } = req.body;
 // Validação: o campo "ativo" precisa ser um booleano explícito
    if (typeof ativo !== 'boolean') {
        res.status(400).json({ mensagem: 'Informe o campo "ativo" como true ou false.' });
        return;
    }

    config.modoManutencao = ativo;
    res.json({ mensagem: `Modo de manutenção ${ativo ? 'ativado' : 'desativado'}.` });
});
// Exporta o router para ser montado na rota /config da aplicação principal
export default router;