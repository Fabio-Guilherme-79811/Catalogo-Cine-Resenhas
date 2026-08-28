import { randomUUID } from 'crypto';
import { Avaliacao, AvaliacaoJSON } from '../entities/Avaliacao';
import { JsonFileHandler } from './JsonFileHandler';
import { IAvaliacaoRepository } from './interfaces/IAvaliacaoRepository';

/**
 * Repositório responsável pela persistência de {@link Avaliacao} em arquivo JSON.
 *
 * Implementa {@link IAvaliacaoRepository} utilizando {@link JsonFileHandler} como
 * mecanismo de leitura e escrita em `avaliacoes.json`.
 */
export class AvaliacaoRepository implements IAvaliacaoRepository {
  private readonly arquivo = new JsonFileHandler<AvaliacaoJSON>('avaliacoes.json');

  /**
   * Lista todas as avaliações cadastradas, de todos os usuários e filmes.
   *
   * @returns Um array com todas as instâncias de {@link Avaliacao} persistidas.
   */
  async listarTodas(): Promise<Avaliacao[]> {
    const dados = await this.arquivo.ler();
    return dados.map((item) => Avaliacao.fromJSON(item));
  }

  /**
   * Busca uma avaliação pelo seu identificador único.
   *
   * @param id - Identificador (UUID) da avaliação.
   * @returns A {@link Avaliacao} correspondente, ou `null` caso não seja encontrada.
   */
  async buscarPorId(id: string): Promise<Avaliacao | null> {
    const avaliacoes = await this.listarTodas();
    return avaliacoes.find((avaliacao) => avaliacao.id === id) ?? null;
  }

  /**
   * Lista todas as avaliações de um filme específico.
   *
   * @param filmeId - Identificador do filme.
   * @returns Um array com as avaliações pertencentes ao filme informado.
   */
  async listarPorFilme(filmeId: string): Promise<Avaliacao[]> {
    const avaliacoes = await this.listarTodas();
    return avaliacoes.filter((avaliacao) => avaliacao.filmeId === filmeId);
  }

  /**
   * Busca a avaliação de um usuário para um filme específico.
   *
   * RNLF31 - localiza a avaliação já existente de um usuário para um filme específico.
   *
   * @param usuarioId - Identificador do usuário.
   * @param filmeId - Identificador do filme.
   * @returns A {@link Avaliacao} correspondente, ou `null` caso não exista.
   */
  // RNLF31 - localiza a avaliação já existente de um usuário para um filme específico
  async buscarPorUsuarioEFilme(usuarioId: string, filmeId: string): Promise<Avaliacao | null> {
    const avaliacoes = await this.listarTodas();
    return (
      avaliacoes.find(
        (avaliacao) => avaliacao.usuarioId === usuarioId && avaliacao.filmeId === filmeId,
      ) ?? null
    );
  }

  /**
   * Cria uma nova avaliação ou atualiza a avaliação existente de um usuário para um filme.
   *
   * RNLF31 - se o usuário já avaliou o filme, atualiza a avaliação existente em vez
   * de criar uma nova, garantindo que cada usuário tenha no máximo uma avaliação por filme.
   * Ao atualizar, o `id` e a `dataCriacao` originais são preservados.
   *
   * @param avaliacao - Dados da avaliação a ser criada ou atualizada.
   * @returns A {@link Avaliacao} criada ou atualizada.
   */
  // RNLF31 - se o usuário já avaliou o filme, atualiza a avaliação existente
  // em vez de criar uma nova (a "unicidade de avaliação" fica garantida aqui)
  async criarOuAtualizar(avaliacao: Avaliacao): Promise<Avaliacao> {
    const avaliacoes = await this.listarTodas();
    const indiceExistente = avaliacoes.findIndex(
      (item) => item.usuarioId === avaliacao.usuarioId && item.filmeId === avaliacao.filmeId,
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

  /**
   * Remove uma avaliação pelo seu identificador.
   *
   * @param id - Identificador da avaliação a ser removida.
   * @returns `true` caso a avaliação tenha sido removida, `false` caso não exista.
   */
  async remover(id: string): Promise<boolean> {
    const avaliacoes = await this.listarTodas();
    const restantes = avaliacoes.filter((avaliacao) => avaliacao.id !== id);
    if (restantes.length === avaliacoes.length) return false;

    await this.arquivo.escrever(restantes.map((item) => item.toJSON()));
    return true;
  }
  /**
   * Calcula a média das notas de um filme.
   *
   * RNLF33 - média calculada dinamicamente: soma de todas as notas válidas dividida
   * pela quantidade total de avaliações do filme, arredondada para uma casa decimal.
   *
   * @param filmeId - Identificador do filme.
   * @returns A média das notas, arredondada para uma casa decimal, ou `0` caso o
   * filme não possua avaliações.
   */
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
