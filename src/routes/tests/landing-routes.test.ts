import request from "supertest"
import app from "../../app"

describe("Landing Routes", () => {
});

test("GET/deve retornar status 200", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body.page).toBe("landing");
    expect(response.body.tittle).toBe("Bem-Vindo!")
});

test("GET/login deve redirecionar para a página de lógin", async () => {
    const response = await request(app).get("/login")
});

test("GET/register deve redirecionar para a página de cadastro", async () => {
    const response = await request(app).get("/register");
    expect(response.status).toBe(302);
});