import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { Conteudo, ConteudoJSON } from '../entities/Conteudo';
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

    async buscarPorGenero(generoId: string): Promise<Conteudo[]> {
        const filmes = await this.listarTodos();
        return filmes.filter(
            (filme) => filme.generoId === generoId || filme.subGenerosIds.includes(generoId)
        );
    }

    async criar(filme: Conteudo): Promise<Conteudo> {
        const filmes = await this.listarTodos();
        const novoFilme = new Conteudo({
            id: filme.id || randomUUID(),
            titulo: filme.titulo,
            sinopse: filme.sinopse,
            anoLancamento: filme.anoLancamento,
            duracaoMinutos: filme.duracaoMinutos,
            capaUrl: filme.capaUrl,
            generoId: filme.generoId,
            subGenerosIds: filme.subGenerosIds,
            direcao: filme.direcao,
        });

        filmes.push(novoFilme);
        await this.arquivo.escrever(filmes.map((item) => item.toJSON()));
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
            anoLancamento: dados.anoLancamento,
            duracaoMinutos: dados.duracaoMinutos,
            capaUrl: dados.capaUrl,
            generoId: dados.generoId,
            subGenerosIds: dados.subGenerosIds,
            direcao: dados.direcao,
        });

        // Se a capa foi trocada, remove a imagem antiga para não acumular lixo em public/uploads/
        if (filmeAntigo.capaUrl && filmeAntigo.capaUrl !== filmeAtualizado.capaUrl) {
            await this.removerArquivoDeCapa(filmeAntigo.capaUrl);
        }

        filmes[indice] = filmeAtualizado;
        await this.arquivo.escrever(filmes.map((item) => item.toJSON()));
        return filmeAtualizado;
    }

    async remover(id: string): Promise<boolean> {
        const filmes = await this.listarTodos();
        const filme = filmes.find((item) => item.id === id);
        if (!filme) return false;

        const restantes = filmes.filter((item) => item.id !== id);
        await this.arquivo.escrever(restantes.map((item) => item.toJSON()));

        await this.removerArquivoDeCapa(filme.capaUrl); // RNLF12
        return true;
    }

    // RNLF12 - remove fisicamente o arquivo de capa de public/uploads/ quando um filme é excluído
    private async removerArquivoDeCapa(capaUrl: string): Promise<void> {
        try {
            const nomeArquivo = path.basename(capaUrl);
            const caminhoCompleto = path.join(this.pastaUploads, nomeArquivo);
            await fs.unlink(caminhoCompleto);
        } catch (erro: any) {
            // Se o arquivo já não existir, não é um erro real — apenas registra os demais casos
            if (erro.code !== 'ENOENT') {
                console.error(`Não foi possível remover a imagem "${capaUrl}":`, erro.message);
            }
        }
    }
}
