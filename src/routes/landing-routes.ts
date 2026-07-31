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

/**
 * Redireciona o usuário para o URL de login
 * 
 * @route GET/login
 * @param _req - Requisição HTTp (não atualizada)
 * @param res - Resposta HTTp com redirecionamento 302 para `APP_URLS.LOGIN`.
 */
 // Rota GET /login: redireciona (302 - redirecionamento temporário) o usuário
// diretamente para a URL de login definida em APP_URLS
router.get("/login", (_req:Request, res:Response) => {
    res.redirect(302, APP_URLS.LOGIN);
});

/**
 * Redireciona o usuário para a URL de cadastro 
 * 
 * @route GET/register
 * @param _req - Requisição HTTP (não atualizada)
 * @param res - Resposta HTTP com redirecionamento 302 para `APP_URLS.REGISTER`.
 */
// Rota GET /register: redireciona (302 - redirecionamento temporário) o usuário
// diretamente para a URL de cadastro definida em APP_URLS
router.get("/register", (_req:Request, res:Response,)=>{
    res.redirect(302, APP_URLS.REGISTER);
});
// Exporta o router para ser utilizado (montado) no arquivo principal da aplicação
export default router; 