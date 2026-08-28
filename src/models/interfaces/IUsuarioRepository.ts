import { Usuario } from '../../entities/Usuario';

/**
 * Contrato de persistência para a entidade {@link Usuario}.
 *
 * Define as operações de CRUD que qualquer repositório de usuários deve
 * implementar, independentemente do mecanismo de armazenamento utilizado
 * (JSON em disco, banco de dados, etc).
 */
export interface IUsuarioRepository {
  /**
   * Lista todos os usuários cadastrados.
   *
   * @returns Um array com todos os usuários persistidos.
   */
  listarTodos(): Promise<Usuario[]>;

  /**
   * Busca um usuário pelo seu identificador único.
   *
   * @param id - Identificador do usuário.
   * @returns O usuário correspondente, ou `null` caso não seja encontrado.
   */
  buscarPorId(id: string): Promise<Usuario | null>;

  /**
   * Busca um usuário pelo e-mail.
   *
   * RNLF01 - utilizado para garantir a unicidade de e-mail antes de criar
   * ou atualizar um usuário.
   *
   * @param email - E-mail a ser pesquisado.
   * @returns O usuário correspondente, ou `null` caso não seja encontrado.
   */
  buscarPorEmail(email: string): Promise<Usuario | null>;

  /**
   * Cria e persiste um novo usuário.
   *
   * @param usuario - Dados do usuário a ser criado.
   * @returns O usuário recém-criado.
   * @throws {Error} Caso já exista um usuário cadastrado com o mesmo e-mail (RNLF01).
   */
  criar(usuario: Usuario): Promise<Usuario>;

  /**
   * Atualiza os dados de um usuário existente.
   *
   * @param id - Identificador do usuário a ser atualizado.
   * @param usuario - Novos dados do usuário.
   * @returns O usuário atualizado, ou `null` caso o `id` não seja encontrado.
   * @throws {Error} Caso o novo e-mail já esteja em uso por outro usuário (RNLF01).
   */
  atualizar(id: string, usuario: Usuario): Promise<Usuario | null>;

  /**
   * Remove um usuário pelo seu identificador.
   *
   * @param id - Identificador do usuário a ser removido.
   * @returns `true` caso o usuário tenha sido removido, `false` caso não exista.
   */
  remover(id: string): Promise<boolean>;
}
