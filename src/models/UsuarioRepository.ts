import { randomUUID } from 'crypto';
import { Usuario, UsuarioJSON } from '../entities/Usuario';
import { JsonFileHandler } from './JsonFileHandler';
import { IUsuarioRepository } from './interfaces/IUsuarioRepository';

/**
 * Repositorio responsável pelo persistência de {@link Usu} me arquivo JSON.
 * 
 * Implementa {@link IUsuarioRepository} utilizando {@link JsonFileHandler} como
 * mecanismo de leitura e escrita em `usuarios.json`.
 */
export class UsuarioRepository implements IUsuarioRepository {
    private readonly arquivo = new JsonFileHandler<UsuarioJSON>('usuarios.json');

    /**
     * Lista todos os usuários cadastrados 
     * 
     * @return em um array com tados as instâncias de {@link usuario} persistidas
     */
    async listarTodos(): Promise<Usuario[]> {
        const dados = await this.arquivo.ler();
        return dados.map((item) => Usuario.fromJSON(item));
    }

    /**
     * Busca um usuário pelo seu identificador único
     * 
     * @param id - identificador (UUID) do usuário
     * @returns o {@link usuario} correspondente, ou `null` caso não seja encontrado.
     */
    async buscarPorId(id: string): Promise<Usuario | null> {
        const usuarios = await this.listarTodos();
        return usuarios.find((usuario) => usuario.id === id) ?? null;
    }

    // RNLF01 - usado antes de criar/atualizar para garantir a unicidade de e-mail
    /**
     * Busca um usuário pelo e-mail (normalizado para minúsculas e sem espaços).
     * 
     * @param email - E-mail a ser pesquisado
     * @returns 0 {@link usuario}corespondente, ou`null` caso não seja encontrado.
     */
    async buscarPorEmail(email: string): Promise<Usuario | null> {
        const usuarios = await this.listarTodos();
        const emailNormalizado = email.trim().toLowerCase();
        return usuarios.find((usuario) => usuario.email === emailNormalizado) ?? null;
    }

    /**
     * Cria e persiste um novo usuário
     * 
     * Gera um `id` automaticamente via {@link randomUUID} caso não seja informado.
     * 
     * @param usuario - dados do usuário a ser criado
     * @returns {ERROR} Caso já exista um usuário cadastrado com o mesmo e-mail (RNLF01)
     */
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

    /**
     * Atualiza os dados de um usuário existente
     * 
     * A data de criação  (`criadoEm`) do usuário original é sempre preservada,
     * independente do valor informado em `dados`.
     * 
     * @param id - identificador do usuário a ser atualizado
     * @param dados - Novos dados do usuário
     * @returns o {@link usuario} atualizado, ou `null` caso o `id` não seja encontrado
     * @throws {ERROR} Caso o novo e-mail já esteja e, uso por outro usuário (RNLF01
     */
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

    /**
     * Remove em usuário pelo seu identificador
     * 
     * @param id - Identificador do usuário a ser removido 
     * @returns `true` caso o usuário tenha sido removido, `false` caso não exista.
     */
    async remover(id: string): Promise<boolean> {
        const usuarios = await this.listarTodos();
        const restantes = usuarios.filter((usuario) => usuario.id !== id);
        if (restantes.length === usuarios.length) return false;

        await this.arquivo.escrever(restantes.map((item) => item.toJSON()));
        return true;
    }
}
