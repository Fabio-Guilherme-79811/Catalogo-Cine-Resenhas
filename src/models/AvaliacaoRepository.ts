import { randomUUID } from 'crypto';
import { Avaliacao, AvaliacaoJSON } from '../entities/Avaliacao';
import { JsonFileHandler } from './JsonFileHandler';
import { IAvaliacaoRepository } from './interfaces/IAvaliacaoRepository';

export class AvaliacaoRepository implements IAvaliacaoRepository {
    private readonly arquivo = new JsonFileHandler<AvaliacaoJSON>('avaliacoes.json');

    async listarTodas(): Promise<Avaliacao[]> {
        const dados = await this.arquivo.ler();
        return dados.map((item) => Avaliacao.fromJSON(item));
    }

    async buscarPorId(id: string): Promise<Avaliacao | null> {
        const avaliacoes = await this.listarTodas();
        return avaliacoes.find((avaliacao) => avaliacao.id === id) ?? null;
    }

    async listarPorFilme(filmeId: string): Promise<Avaliacao[]> {
        const avaliacoes = await this.listarTodas();
        return avaliacoes.filter((avaliacao) => avaliacao.filmeId === filmeId);
    }

    // RNLF31 - localiza a avaliação já existente de um usuário para um filme específico
    async buscarPorUsuarioEFilme(usuarioId: string, filmeId: string): Promise<Avaliacao | null> {
        const avaliacoes = await this.listarTodas();
        return (
            avaliacoes.find(
                (avaliacao) => avaliacao.usuarioId === usuarioId && avaliacao.filmeId === filmeId
            ) ?? null
        );
    }

    // RNLF31 - se o usuário já avaliou o filme, atualiza a avaliação existente
    // em vez de criar uma nova (a "unicidade de avaliação" fica garantida aqui)
    async criarOuAtualizar(avaliacao: Avaliacao): Promise<Avaliacao> {
        const avaliacoes = await this.listarTodas();
        const indiceExistente = avaliacoes.findIndex(
            (item) => item.usuarioId === avaliacao.usuarioId && item.filmeId === avaliacao.filmeId
        );

        if (indiceExistente !== -1) {
            const avaliacaoAtualizada = new Avaliacao({
                id: avaliacoes[indiceExistente].id,
                filmeId: avaliacao.filmeId,
                usuarioId: avaliacao.usuarioId,
                nota: avaliacao.nota,
                comentario: avaliacao.comentario,
                dataCriacao: avaliacoes[indiceExistente].dataCriacao,
            });

            avaliacoes[indiceExistente] = avaliacaoAtualizada;
            await this.arquivo.escrever(avaliacoes.map((item) => item.toJSON()));
            return avaliacaoAtualizada;
        }

        const novaAvaliacao = new Avaliacao({
            id: avaliacao.id || randomUUID(),
            filmeId: avaliacao.filmeId,
            usuarioId: avaliacao.usuarioId,
            nota: avaliacao.nota,
            comentario: avaliacao.comentario,
            dataCriacao: avaliacao.dataCriacao,
        });

        avaliacoes.push(novaAvaliacao);
        await this.arquivo.escrever(avaliacoes.map((item) => item.toJSON()));
        return novaAvaliacao;
    }

    async remover(id: string): Promise<boolean> {
        const avaliacoes = await this.listarTodas();
        const restantes = avaliacoes.filter((avaliacao) => avaliacao.id !== id);
        if (restantes.length === avaliacoes.length) return false;

        await this.arquivo.escrever(restantes.map((item) => item.toJSON()));
        return true;
    }

    // RNLF33 - média calculada dinamicamente: soma de todas as notas válidas
    // dividida pela quantidade total de avaliações do filme
    async calcularMediaDoFilme(filmeId: string): Promise<number> {
        const avaliacoesDoFilme = await this.listarPorFilme(filmeId);
        if (avaliacoesDoFilme.length === 0) return 0;

        const soma = avaliacoesDoFilme.reduce((total, avaliacao) => total + avaliacao.nota, 0);
        const media = soma / avaliacoesDoFilme.length;

        return Math.round(media * 10) / 10;
    }
}
