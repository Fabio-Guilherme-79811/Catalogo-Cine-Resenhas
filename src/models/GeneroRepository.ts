import { randomUUID } from 'crypto';
import { Genero, GeneroJSON } from '../entities/Genero';
import { JsonFileHandler } from './JsonFileHandler';
import { IGeneroRepository } from './interfaces/IGeneroRepository';
import { ConteudoRepository } from './ConteudoRepository';

/**
 * Repositório responsável pela persistência de {@link Genero} em arquivo JSON.
 *
 * Implementa {@link IGeneroRepository} utilizando {@link JsonFileHandler} como
 * mecanismo de leitura e escrita em `generos.json`. Depende de
 * {@link ConteudoRepository} para validar se um gênero está em uso antes de removê-lo.
 */
export class GeneroRepository implements IGeneroRepository {
    private readonly arquivo = new JsonFileHandler<GeneroJSON>('generos.json');
    // Usado apenas para checar a RNLF21 (gênero em uso não pode ser removido)
    private readonly conteudoRepository = new ConteudoRepository();


    /**
     * Lista todos os gêneros cadastrados.
     *
     * @returns Um array com todas as instâncias de {@link Genero} persistidas.
     */
    async listarTodos(): Promise<Genero[]> {
        const dados = await this.arquivo.ler();
        return dados.map((item) => Genero.fromJSON(item));
    }

      /**
     * Busca um gênero pelo seu identificador único.
     *
     * @param id - Identificador (UUID) do gênero.
     * @returns O {@link Genero} correspondente, ou `null` caso não seja encontrado.
     */
    async buscarPorId(id: string): Promise<Genero | null> {
        const generos = await this.listarTodos();
        return generos.find((genero) => genero.id === id) ?? null;
    }

     /**
     * Busca um gênero pelo nome normalizado.
     *
     * RNLF20 - usado antes de criar/atualizar para garantir a unicidade de nome.
     *
     * @param nome - Nome do gênero a ser pesquisado.
     * @returns O {@link Genero} correspondente, ou `null` caso não seja encontrado.
     */
    // RNLF20 - usado antes de criar/atualizar para garantir a unicidade de nome
    async buscarPorNome(nome: string): Promise<Genero | null> {
        const generos = await this.listarTodos();
        const nomeNormalizado = nome.trim().toLowerCase();
        return generos.find((genero) => genero.nomeNormalizado === nomeNormalizado) ?? null;
    }

     /**
     * Cria e persiste um novo gênero.
     *
     * Gera um `id` automaticamente via {@link randomUUID} caso não seja informado.
     *
     * @param genero - Dados do gênero a ser criado.
     * @returns O {@link Genero} recém-criado.
     * @throws {Error} Caso já exista um gênero cadastrado com o mesmo nome (RNLF20).
     */
    async criar(genero: Genero): Promise<Genero> {
        const existente = await this.buscarPorNome(genero.nome);
        if (existente) {
            throw new Error('Já existe um gênero cadastrado com este nome.'); // RNLF20
        }

        const generos = await this.listarTodos();
        const novoGenero = new Genero({
            id: genero.id || randomUUID(),
            nome: genero.nome,
            descricao: genero.descricao,
            ativo: genero.ativo,
        });

        generos.push(novoGenero);
        await this.arquivo.escrever(generos.map((item) => item.toJSON()));
        return novoGenero;
    }

     /**
     * Atualiza os dados de um gênero existente.
     *
     * @param id - Identificador do gênero a ser atualizado.
     * @param dados - Novos dados do gênero.
     * @returns O {@link Genero} atualizado, ou `null` caso o `id` não seja encontrado.
     * @throws {Error} Caso o novo nome já esteja em uso por outro gênero (RNLF20).
     */
    async atualizar(id: string, dados: Genero): Promise<Genero | null> {
        const generos = await this.listarTodos();
        const indice = generos.findIndex((genero) => genero.id === id);
        if (indice === -1) return null;

        const nomeEmUsoPorOutroGenero = generos.some(
            (genero) => genero.id !== id && genero.nomeNormalizado === dados.nomeNormalizado
        );
        if (nomeEmUsoPorOutroGenero) {
            throw new Error('Já existe um gênero cadastrado com este nome.'); // RNLF20
        }

        const generoAtualizado = new Genero({
            id,
            nome: dados.nome,
            descricao: dados.descricao,
            ativo: dados.ativo,
        });

        generos[indice] = generoAtualizado;
        await this.arquivo.escrever(generos.map((item) => item.toJSON()));
        return generoAtualizado;
    }

      /**
     * Remove um gênero pelo seu identificador.
     *
     * Antes de remover, verifica se o gênero está associado a algum filme/conteúdo
     * (como gênero principal ou sub-gênero) e impede a remoção nesse caso.
     *
     * @param id - Identificador do gênero a ser removido.
     * @returns `true` caso o gênero tenha sido removido, `false` caso não exista.
     * @throws {Error} Caso o gênero esteja associado a filmes existentes (RNLF21).
     */
    async remover(id: string): Promise<boolean> {
        // RNLF21 - não é permitido remover um gênero associado a algum filme/sub-gênero
        const filmes = await this.conteudoRepository.listarTodos();
        const generoEmUso = filmes.some(
            (filme) => filme.generoId === id || filme.subGenerosIds.includes(id)
        );
        if (generoEmUso) {
            throw new Error('Não é possível remover um gênero associado a filmes existentes.');
        }

        const generos = await this.listarTodos();
        const restantes = generos.filter((genero) => genero.id !== id);
        if (restantes.length === generos.length) return false;

        await this.arquivo.escrever(restantes.map((item) => item.toJSON()));
        return true;
    }
}
