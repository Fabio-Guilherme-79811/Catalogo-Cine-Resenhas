import { randomUUID } from 'crypto';
import { Usuario, UsuarioJSON } from '../entities/Usuario';
import { JsonFileHandler } from './JsonFileHandler';
import { IUsuarioRepository } from './interfaces/IUsuarioRepository';

export class UsuarioRepository implements IUsuarioRepository {
    private readonly arquivo = new JsonFileHandler<UsuarioJSON>('usuarios.json');

    async listarTodos(): Promise<Usuario[]> {
        const dados = await this.arquivo.ler();
        return dados.map((item) => Usuario.fromJSON(item));
    }

    async buscarPorId(id: string): Promise<Usuario | null> {
        const usuarios = await this.listarTodos();
        return usuarios.find((usuario) => usuario.id === id) ?? null;
    }

    // RNLF01 - usado antes de criar/atualizar para garantir a unicidade de e-mail
    async buscarPorEmail(email: string): Promise<Usuario | null> {
        const usuarios = await this.listarTodos();
        const emailNormalizado = email.trim().toLowerCase();
        return usuarios.find((usuario) => usuario.email === emailNormalizado) ?? null;
    }

    async criar(usuario: Usuario): Promise<Usuario> {
        const existente = await this.buscarPorEmail(usuario.email);
        if (existente) {
            throw new Error('Já existe um usuário cadastrado com este e-mail.'); // RNLF01
        }

        const usuarios = await this.listarTodos();
        const novoUsuario = new Usuario({
            id: usuario.id || randomUUID(),
            nome: usuario.nome,
            email: usuario.email,
            senhaHash: usuario.senhaHash,
            role: usuario.role, // já nasce "comum" por padrão dentro da entidade (RNLF04)
            criadoEm: usuario.criadoEm,
        });

        usuarios.push(novoUsuario);
        await this.arquivo.escrever(usuarios.map((item) => item.toJSON()));
        return novoUsuario;
    }

    async atualizar(id: string, dados: Usuario): Promise<Usuario | null> {
        const usuarios = await this.listarTodos();
        const indice = usuarios.findIndex((usuario) => usuario.id === id);
        if (indice === -1) return null;

        const emailEmUsoPorOutroUsuario = usuarios.some(
            (usuario) => usuario.id !== id && usuario.email === dados.email
        );
        if (emailEmUsoPorOutroUsuario) {
            throw new Error('Já existe um usuário cadastrado com este e-mail.'); // RNLF01
        }

        const usuarioAtualizado = new Usuario({
            id,
            nome: dados.nome,
            email: dados.email,
            senhaHash: dados.senhaHash,
            role: dados.role,
            criadoEm: usuarios[indice].criadoEm, // data de criação nunca muda
        });

        usuarios[indice] = usuarioAtualizado;
        await this.arquivo.escrever(usuarios.map((item) => item.toJSON()));
        return usuarioAtualizado;
    }

    async remover(id: string): Promise<boolean> {
        const usuarios = await this.listarTodos();
        const restantes = usuarios.filter((usuario) => usuario.id !== id);
        if (restantes.length === usuarios.length) return false;

        await this.arquivo.escrever(restantes.map((item) => item.toJSON()));
        return true;
    }
}
