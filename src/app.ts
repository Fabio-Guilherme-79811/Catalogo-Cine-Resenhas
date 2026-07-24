import express, {Request,Response, NextFunction,Application}  from 'express';
import landingRoutes from './routes/routes-landing';
const app: Application = express();




app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use("/", landingRoutes);


app.get ('/',(req:Request, res:Response, next:NextFunction) =>{
    res.send('Typesscript & Express rodando lizin');
});

export default app;