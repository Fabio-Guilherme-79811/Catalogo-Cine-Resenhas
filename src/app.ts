import express, {Request,Response, NextFunction}  from 'express';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));


app.get ('/',(req:Request, res:Response, next:NextFunction) =>{
    res.send('Typesscript & Express rodando lizin');
});

//================================== SERVER ========================================
app.listen(port, () =>{
    console.log(`Servidor ativo na porta http://localhost&{port}`)
});