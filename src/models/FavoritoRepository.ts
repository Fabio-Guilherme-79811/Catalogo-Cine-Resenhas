import { randomUUID } from 'crypto';
import { Favorito, FavoritoJSON } from '../entities/Favorito';
import { JsonFileHandler } from './JsonFileHandler';
import { IFavoritoRepository } from './interfaces/IFavoritoRepository';

/**
 * Repositório responsável pela persistência de {@link Favorito} em arquivo JSON.
 *
 * Implementa {@link IFavoritoRepository} utilizando {@link JsonFileHandler} como
 * mecanismo de leitura e escrita em `favoritos.json`.
 */
export class FavoritoRepository implements IFavoritoRepository {
  private readonly arquivo = new JsonFileHandler<FavoritoJSON>('favoritos.json');

  /**
   * Lista todos os favoritos cadastrados, de todos os usuários.
   *
   * @returns Um array com todas as instâncias de {@link Favorito} persistidas.
   */
  async listarTodos(): Promise<Favorito[]> {
    const dados = await this.arquivo.ler();
    return dados.map((item) => Favorito.fromJSON(item));
  }

  /**
   * Lista todos os favoritos de um usuário específico.
   *
   * @param usuarioId - Identificador do usuário.
   * @returns Um array com os favoritos pertencentes ao usuário informado.
   */
  async listarPorUsuario(usuarioId: string): Promise<Favorito[]> {
    const favoritos = await this.listarTodos();
    return favoritos.filter((favorito) => favorito.usuarioId === usuarioId);
  }

  /**
   * Busca um favorito específico pela combinação de usuário e filme.
   *
   * @param usuarioId - Identificador do usuário.
   * @param filmeId - Identificador do filme.
   * @returns O {@link Favorito} correspondente, ou `null` caso não exista.
   */
  async buscar(usuarioId: string, filmeId: string): Promise<Favorito | null> {
    const favoritos = await this.listarTodos();
    return (
      favoritos.find(
        (favorito) => favorito.usuarioId === usuarioId && favorito.filmeId === filmeId,
      ) ?? null
    );
  }

  /**
   * Adiciona um filme aos favoritos de um usuário.
   *
   * Caso o filme já esteja favoritado pelo usuário, a operação é idempotente:
   * o favorito existente é retornado em vez de gerar um erro ou uma duplicidade.
   *
   * @param favorito - Dados do favorito a ser adicionado.
   * @returns O {@link Favorito} recém-criado, ou o já existente caso já estivesse favoritado.
   */
  async adicionar(favorito: Favorito): Promise<Favorito> {
    const existente = await this.buscar(favorito.usuarioId, favorito.filmeId);
    if (existente) return existente; // já favoritado: evita duplicidade sem lançar erro

    const favoritos = await this.listarTodos();
    const novoFavorito = new Favorito({
      id: favorito.id || randomUUID(),
      usuarioId: favorito.usuarioId,
      filmeId: favorito.filmeId,
      adicionadoEm: favorito.adicionadoEm,
    });

    favoritos.push(novoFavorito);
    await this.arquivo.escrever(favoritos.map((item) => item.toJSON()));
    return novoFavorito;
  }

  /**
   * Remove um favorito com base na combinação de usuário e filme.
   *
   * @param usuarioId - Identificador do usuário.
   * @param filmeId - Identificador do filme.
   * @returns `true` caso o favorito tenha sido removido, `false` caso não exista.
   */
  async remover(usuarioId: string, filmeId: string): Promise<boolean> {
    const favoritos = await this.listarTodos();
    const restantes = favoritos.filter(
      (favorito) => !(favorito.usuarioId === usuarioId && favorito.filmeId === filmeId),
    );
    if (restantes.length === favoritos.length) return false;

    await this.arquivo.escrever(restantes.map((item) => item.toJSON()));
    return true;
  }
}
