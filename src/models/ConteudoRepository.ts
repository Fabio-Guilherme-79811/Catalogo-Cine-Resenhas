import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { Conteudo, ConteudoJSON } from '../entities/conteudo';
import { JsonFileHandler } from './JsonFileHandler';
import { IConteudoRepository } from './interfaces/IConteudoRepository';

export class ConteudoRepository implements IConteudoRepository {
    private readonly arquivo = new JsonFileHandler<ConteudoJSON>('conteudo.json');
    private readonly pastaUploads = path.join(__dirname, '..', '..', 'public', 'uploads');

    async listarTodos(): Promise<Conteudo[]> {
        const dados = await this.arquivo.ler();
        return dados.map((item) => Conteudo.fromJSON(item));
    }

    async buscarPorId(id: string): Promise<Conteudo | null> {
        const filmes = await this.listarTodos();
        return filmes.find((filme) => filme.id === id) ?? null;
    }

    async buscarPorGenero(genero: string): Promise<Conteudo[]> {
        const filmes = await this.listarTodos();
        return filmes.filter((filme) => String(filme.genero) === genero);
    }

    async criar(filme: Conteudo): Promise<Conteudo> {
        const filmes = await this.listarTodos();

        const novoFilme = new Conteudo({
            id: String(filme.id || randomUUID()),
            titulo: filme.titulo,
            sinopse: filme.sinopse,
            capaUrl: filme.capaUrl,
            genero: filme.genero,
            anoLancamento: filme.anoLancamento,
            diretor: filme.diretor,
            tipo: filme.tipo,
            duracao: filme.duracao,
            direcao: filme.direcao,
            avaliacao: filme.avaliacao,
        });

        filmes.push(novoFilme);

        await this.arquivo.escrever(
            filmes.map((item) => item.toJSON())
        );

        return novoFilme;
    }

    async atualizar(id: string, dados: Conteudo): Promise<Conteudo | null> {
        const filmes = await this.listarTodos();

        const indice = filmes.findIndex((filme) => filme.id === id);

        if (indice === -1) return null;

        const filmeAntigo = filmes[indice];

        const filmeAtualizado = new Conteudo({
            id,
            titulo: dados.titulo,
            sinopse: dados.sinopse,
            capaUrl: dados.capaUrl,
            genero: dados.genero,
            anoLancamento: dados.anoLancamento,
            diretor: dados.diretor,
            tipo: dados.tipo,
            duracao: dados.duracao,
            direcao: dados.direcao,
            avaliacao: dados.avaliacao,
        });

        if (
            filmeAntigo.capaUrl &&
            filmeAntigo.capaUrl !== filmeAtualizado.capaUrl
        ) {
            await this.removerArquivoDeCapa(filmeAntigo.capaUrl);
        }

        filmes[indice] = filmeAtualizado;

        await this.arquivo.escrever(
            filmes.map((item) => item.toJSON())
        );

        return filmeAtualizado;
    }

    async remover(id: string): Promise<boolean> {
        const filmes = await this.listarTodos();

        const filme = filmes.find((item) => item.id === id);

        if (!filme) return false;

        const restantes = filmes.filter((item) => item.id !== id);

        await this.arquivo.escrever(
            restantes.map((item) => item.toJSON())
        );

        await this.removerArquivoDeCapa(filme.capaUrl);

        return true;
    }

    private async removerArquivoDeCapa(capaUrl: string): Promise<void> {
        try {
            const nomeArquivo = path.basename(capaUrl);
            const caminhoCompleto = path.join(this.pastaUploads, nomeArquivo);

            await fs.unlink(caminhoCompleto);
        } catch (erro: any) {
            if (erro.code !== 'ENOENT') {
                console.error(
                    `Não foi possível remover a imagem "${capaUrl}":`,
                    erro.message
                );
            }
        }
    }
}