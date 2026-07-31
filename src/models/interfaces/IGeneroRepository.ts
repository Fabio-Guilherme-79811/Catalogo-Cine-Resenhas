import { Genero } from '../../entities/Genero';


/**
 * Contrato de persistência para a entidade {@link Genero}.
 *
 * Define as operações de CRUD que qualquer repositório de gêneros deve
 * implementar, independentemente do mecanismo de armazenamento utilizado
 * (JSON em disco, banco de dados, etc).
 */
export interface IGeneroRepository {

    /**
     * Lista todos os gêneros cadastrados.
     *
     * @returns Um array com todos os gêneros persistidos.
     */
    listarTodos(): Promise<Genero[]>;

    /**
     * Busca um gênero pelo seu identificador único.
     *
     * @param id - Identificador do gênero.
     * @returns O gênero correspondente, ou `null` caso não seja encontrado.
     */
    buscarPorId(id: string): Promise<Genero | null>;

    /**
     * Busca um gênero pelo nome.
     *
     * RNLF20 - utilizado para garantir a unicidade de nome antes de criar
     * ou atualizar um gênero.
     *
     * @param nome - Nome do gênero a ser pesquisado.
     * @returns O gênero correspondente, ou `null` caso não seja encontrado.
     */
    buscarPorNome(nome: string): Promise<Genero | null>;


    /**
     * Cria e persiste um novo gênero.
     *
     * @param genero - Dados do gênero a ser criado.
     * @returns O gênero recém-criado.
     * @throws {Error} Caso já exista um gênero cadastrado com o mesmo nome (RNLF20).
     */
    criar(genero: Genero): Promise<Genero>;


    /**
     * Atualiza os dados de um gênero existente.
     *
     * @param id - Identificador do gênero a ser atualizado.
     * @param genero - Novos dados do gênero.
     * @returns O gênero atualizado, ou `null` caso o `id` não seja encontrado.
     * @throws {Error} Caso o novo nome já esteja em uso por outro gênero (RNLF20).
     */
    atualizar(id: string, genero: Genero): Promise<Genero | null>;

    /**
     * Remove um gênero pelo seu identificador.
     *
     * RNLF21 - a remoção é impedida caso o gênero esteja associado a algum
     * filme/conteúdo existente (como gênero principal ou sub-gênero).
     *
     * @param id - Identificador do gênero a ser removido.
     * @returns `true` caso o gênero tenha sido removido, `false` caso não exista.
     * @throws {Error} Caso o gênero esteja associado a filmes existentes (RNLF21).
     */
    remover(id: string): Promise<boolean>;


}
