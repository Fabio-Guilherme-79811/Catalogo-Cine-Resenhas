const request = require("supertest");
import app from "../../app";

describe("Auth routes", () => {
    // Testa se a rota de login redireciona corretamente para a página de login
    test("GET/login deve redirecionar para a página de login", async () => {
        const response = await request(app)
            .get("/login");

        expect(response.statusCode).toBe(302);
        console.log(response.headers.location);
    });

     // Testa se a página de cadastro é acessada corretamente
    test("GET/registro deve retornar a página de cadastro", async () => {
        const response = await request(app)
            .get("/cadastro");

        expect(response.statusCode).toBe(302);
    });

     // Testa se um novo usuário consegue se cadastrar com dados válidos
    test("POST/registro deve cadastrar usuário", async () => {
        const response = await request(app)
            .post("/registro")
            .send({
                nome: "Teste",
                email: "teste@email.com",
                senha: "123456"
            });

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe("/login");
    });

});