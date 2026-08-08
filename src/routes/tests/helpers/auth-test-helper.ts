import request from 'supertest';
import bcrypt from 'bcryptjs';
import { Usuario } from '../../../entities/Usuario';
import { UsuarioRepository } from '../../../models/UsuarioRepository';

/**
 * Helper compartilhado pelos testes de integração: cria um usuário real
 * (comum ou admin) via {@link UsuarioRepository} e efetua login pela rota
 * real `POST /entrar`, retornando o cookie de sessão pronto para ser
 * reutilizado em outras requisições supertest.
 *
 * @remarks
 * Substitui a antiga simulação por header `x-user-role`, que nunca existiu
 * de fato na implementação de `isAuthenticated` (baseada em JWT via
 * cookie). Usar o fluxo real de autenticação torna os testes de rota
 * fiéis ao comportamento em produção.
 */
export async function criarUsuarioAutenticado(
    app: import('express').Application,
    opcoes: { role?: 'admin' | 'comum'; nome?: string } = {}
): Promise<{ usuario: Usuario; cookie: string }> {
    const usuarioRepository = new UsuarioRepository();
    const senha = 'senha123';
    const senhaHash = await bcrypt.hash(senha, 10);
    const email = `${opcoes.role ?? 'comum'}-${Date.now()}-${Math.random().toString(36).slice(2)}@email.com`;

    const usuario = await usuarioRepository.criar(
        new Usuario({
            id: '',
            nome: opcoes.nome ?? (opcoes.role === 'admin' ? 'Admin Teste' : 'Usuário Teste'),
            email,
            senhaHash,
            role: opcoes.role ?? 'comum',
        })
    );

    const resposta = await request(app).post('/entrar').send({ email, senha });
    const cookies = resposta.headers['set-cookie'];
    const cookie = Array.isArray(cookies) ? cookies[0] : String(cookies);

    return { usuario, cookie };
}
