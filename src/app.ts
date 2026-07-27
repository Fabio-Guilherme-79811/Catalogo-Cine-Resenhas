import express, {Request,Response, NextFunction,Application}  from 'express';
import landingRoutes from './routes/landing-routes';
import authRoutes from './routes/auth-routes';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

app.use("/", landingRoutes);
app.use("/", authRoutes);

export default app;