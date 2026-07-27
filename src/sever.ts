import app from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
    console.log(`Server rodando na porta http://localhost:${PORT}`);
});

