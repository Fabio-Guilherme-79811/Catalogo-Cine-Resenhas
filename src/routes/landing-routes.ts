import {Router, Request, Response} from 'express';
import { APP_URLS } from '../config/Urls';
// Cria uma instância de Router do Express para agrupar as rotas deste módulo
const router = Router();
// Rota raiz (GET /): retorna os dados da página de landing em formato JSON,
// incluindo textos e os links (CTAs) para login e cadastro
/**
 * Retorna os dados da página de landing em formato JSON
 *
 * @route GET/
 * @param _req - requisição HTTP (não atualizada)
 * @param res - resposta HTTP contendo o indentificador da página, título e os
 * CTAs (call-to-action) de login e cadastro, com seus respectivos labels e URLs
 */
router.get("/", (_req: Request, res: Response) => {
    res.render("pages/index", {
        title: "Bem-Vindo!",
        css: "index",
        cta: {
            login: {
                label: "Entrar",
                url: APP_URLS.LOGIN
            },
            register: {
                label: "Cadastrar",
                url: APP_URLS.REGISTER
            }
        }
    });
});

// As rotas GET /login e GET /register que existiam aqui foram removidas:
// a renderização das páginas de login/cadastro agora é responsabilidade
// exclusiva de `paginas-routes.ts` (ver GET /login e GET /cadastro lá),
// para não haver dois handlers concorrendo pelo mesmo caminho.

// Exporta o router para ser utilizado (montado) no arquivo principal da aplicação
export default router;
