import {Router, Request, Response} from 'express';
import { APP_URLS } from '../config/Urls';

const router = Router();

router.get("/", (_req:Request, res:Response) => {
    res.json({
        page:"landig",
        tittle:"Bem-Vindo!",
        cta:{
            loging:{
                label:"Entrar",
                url:APP_URLS.LOGIN,
            },
            register:{
                label:"Cadastrar",
                url: APP_URLS.REGISTER,
            }
        }
    })
});
    
router.get("/login", (_req:Request, res:Response) => {
    res.redirect(302, APP_URLS.LOGIN);
});

router.get("/register", (_req:Request, res:Response,)=>{
    res.redirect(302, APP_URLS.REGISTER);
});

export default router; 