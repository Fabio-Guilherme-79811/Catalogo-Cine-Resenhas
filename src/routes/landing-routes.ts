import {Router, Request, Response} from 'express';
import { APP_URLS } from '../config/Urls';
// Cria uma instância de Router do Express para agrupar as rotas deste módulo
const router = Router();
// Rota raiz (GET /): retorna os dados da página de landing em formato JSON,
// incluindo textos e os links (CTAs) para login e cadastro
router.get("/", (_req:Request, res:Response) => {
    res.json({
        page:"landing", // identificador da página
        title:"Bem-Vindo!",// título exibido na landing page
        cta:{// call-to-action: botões/links de ação
            login:{// dados do botão de login
                label:"Entrar",// texto exibido no botão
                url:APP_URLS.LOGIN,// URL de destino, vinda da configuração central de URLs
            },
            register:{// dados do botão de cadastro
                label:"Cadastrar",// texto exibido no botão
                url: APP_URLS.REGISTER,// URL de destino, vinda da configuração central de URLs
            }
        }
    })
});
 // Rota GET /login: redireciona (302 - redirecionamento temporário) o usuário
// diretamente para a URL de login definida em APP_URLS
router.get("/login", (_req:Request, res:Response) => {
    res.redirect(302, APP_URLS.LOGIN);
});
// Rota GET /register: redireciona (302 - redirecionamento temporário) o usuário
// diretamente para a URL de cadastro definida em APP_URLS
router.get("/register", (_req:Request, res:Response,)=>{
    res.redirect(302, APP_URLS.REGISTER);
});
// Exporta o router para ser utilizado (montado) no arquivo principal da aplicação
export default router; 