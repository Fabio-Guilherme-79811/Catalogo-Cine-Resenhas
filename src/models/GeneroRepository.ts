import { randomUUID } from 'crypto';
import { Genero, GeneroJSON } from '../entities/Genero';
import { JsonFileHandler } from './JsonFileHandler';
import { IGeneroRepository } from './interfaces/IGeneroRepository';
import { ConteudoRepository } from './ConteudoRepository';

export class GeneroRepository implements IGeneroRepository {
    private readonly arquivo = new JsonFileHandler<GeneroJSON>('generos.json');
    // Usado apenas para checar a RNLF21 (gênero em uso não pode ser removido)
    private readonly conteudoRepository = new ConteudoRepository();

    async listarTodos(): Promise<Genero[]> {
        const dados = await this.arquivo.ler();
        return dados.map((item) => Genero.fromJSON(item));
    }

    async buscarPorId(id: string): Promise<Genero | null> {
        const generos = await this.listarTodos();
        return generos.find((genero) => genero.id === id) ?? null;
    }

    // RNLF20 - usado antes de criar/atualizar para garantir a unicidade de nome
    async buscarPorNome(nome: string): Promise<Genero | null> {
        const generos = await this.listarTodos();
        const nomeNormalizado = nome.trim().toLowerCase();
        return generos.find((genero) => genero.nomeNormalizado === nomeNormalizado) ?? null;
    }

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
