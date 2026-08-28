import { Favorito } from '../../entities/Favorito';

/**
 * Contrato de persistência para a entidade {@link Favorito}.
 *
 * Define as operações que qualquer repositório de favoritos deve implementar,
 * independentemente do mecanismo de armazenamento utilizado (JSON em disco,
 * banco de dados, etc).
 */
export interface IFavoritoRepository {
  /**
   * Lista todos os favoritos cadastrados, de todos os usuários.
   *
   * @returns Um array com todos os favoritos persistidos.
   */
  listarTodos(): Promise<Favorito[]>;

  /**
   * Lista todos os favoritos de um usuário específico.
   *
   * @param usuarioId - Identificador do usuário.
   * @returns Um array com os favoritos pertencentes ao usuário informado.
   */
  listarPorUsuario(usuarioId: string): Promise<Favorito[]>;

  /**
   * Busca um favorito específico pela combinação de usuário e filme.
   *
   * @param usuarioId - Identificador do usuário.
   * @param filmeId - Identificador do filme.
   * @returns O favorito correspondente, ou `null` caso não exista.
   */
  buscar(usuarioId: string, filmeId: string): Promise<Favorito | null>;

  /**
   * Adiciona um filme aos favoritos de um usuário.
   *
   * A operação deve ser idempotente: caso o filme já esteja favoritado
   * pelo usuário, o favorito existente deve ser retornado em vez de gerar
   * uma duplicidade.
   *
   * @param favorito - Dados do favorito a ser adicionado.
   * @returns O favorito recém-criado, ou o já existente caso já estivesse favoritado.
   */
  adicionar(favorito: Favorito): Promise<Favorito>;

  /**
   * Remove um favorito com base na combinação de usuário e filme.
   *
   * @param usuarioId - Identificador do usuário.
   * @param filmeId - Identificador do filme.
   * @returns `true` caso o favorito tenha sido removido, `false` caso não exista.
   */
  remover(usuarioId: string, filmeId: string): Promise<boolean>;
}
