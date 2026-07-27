const request = require("supertest");
import app from "../../app";

describe("Auth routes", () => {

    test("GET/login deve redirecionar para a página de login", async () => {
        const response = await request(app)
            .get("/login");

        expect(response.statusCode).toBe(302);
        console.log(response.headers.location);
    });


    test("GET/registro deve retornar a página de cadastro", async () => {
        const response = await request(app)
            .get("/cadastro");

        expect(response.statusCode).toBe(302);
    });


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