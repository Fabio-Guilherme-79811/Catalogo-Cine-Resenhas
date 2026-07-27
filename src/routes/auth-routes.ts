import {Router, Request, Response} from 'express'

const router = Router();

const AUTH_BASE_URL = process.env.AUTH_BASE_URL || '';

router.get('/login', (req:Request, res:Response) =>{
    const destino = AUTH_BASE_URL ? '${AUTH_BASE_URL}/login' : '/auth/login';
    res.redirect(destino);
});

router.get('/cadastro', (req:Request, res:Response) =>{
    const destino = AUTH_BASE_URL ? '${AUTH_BASE_URL}/login' : '/auth/cadastro';
    res.redirect(destino);
});

router.get('/register', (req:Request, res:Response) =>{
    res.redirect('/cadastro');
});

router.post('/registro', (req: Request, res: Response) => {

    const { nome, email, senha } = req.body;

    console.log(nome, email, senha);

    res.redirect('/login');
});

export default router;
