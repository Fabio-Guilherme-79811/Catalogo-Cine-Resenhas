/**
 * Configuração principal da aplicação Express.
 *
 * Este módulo é responsável por criar e configurar a instância
 * da aplicação, incluindo:
 *
 * - Configuração dos middlewares de leitura de JSON;
 * - Configuração de dados enviados por formulários;
 * - Disponibilização de arquivos estáticos da pasta public;
 * - Registro das rotas principais da aplicação.
 *
 * O servidor HTTP é iniciado separadamente no arquivo server.ts.
 */

import express, {Request,Response, NextFunction,Application}  from 'express';
import landingRoutes from './routes/landing-routes';
import authRoutes from './routes/auth-routes';

/**
 * Instância principal da aplicação Express.
 */
const app: Application = express();

/**
 * Permite receber requisições com corpo em formato JSON.
 */
app.use(express.json());

/**
 * Permite receber dados enviados por formulários HTML.
 */
app.use(express.urlencoded({extended:true}));

/**
 * Disponibiliza arquivos estáticos da pasta public.
 *
 * Exemplo:
 * /css/style.css
 * /images/logo.png
 */
app.use(express.static("public"));

/**
 * Rotas relacionadas à página inicial da aplicação.
 */
app.use("/", landingRoutes);

/**
 * Rotas relacionadas à autenticação de usuários.
 */
app.use("/", authRoutes);

export default app;