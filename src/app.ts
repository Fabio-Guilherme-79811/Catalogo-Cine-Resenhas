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
import routes from "./routes/index-routes";

/**
 * Instância principal da aplicação Express.
 */
const app: Application = express();

/**
 * Permite receber requisições com corpo em formato JSON.
 */
app.use(express.json());
//Vizualizar ejs//
app.set("view engine", "ejs");
app.set("views", "./src/views");
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

/*Rota para as páginas*/
app.use("/", routes);


export default app;
