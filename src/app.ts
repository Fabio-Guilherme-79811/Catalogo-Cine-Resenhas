import express, {Request,Response, NextFunction}  from 'express';

const app = express();
const port = 3000;

app.get ('/',(req:Request, res:Response, nex:NextFunction) =>{
    res.send('Typesscript & Express rodando lizin');
});

app.listen(port, () =>{
    console.log(`Servidor ativo na porta &{port}``)
});