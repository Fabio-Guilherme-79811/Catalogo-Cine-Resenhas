import { Conteudo } from '../../entities/conteudo';


/**
 * Contrato de persistência para a entidade {@link Conteudo}.
 *
 * Define as operações de CRUD que qualquer repositório de conteúdos
 * (filmes/séries) deve implementar, independentemente do mecanismo de
 * armazenamento utilizado (JSON em disco, banco de dados, etc).
 */
export interface IConteudoRepository {

    /**
     * Lista todos os conteúdos cadastrados.
     *
     * @returns Um array com todos os conteúdos persistidos.
     */
    listarTodos(): Promise<Conteudo[]>;


    /**
     * Busca um conteúdo pelo seu identificador único.
     *
     * @param id - Identificador do conteúdo.
     * @returns O conteúdo correspondente, ou `null` caso não seja encontrado.
     */
    buscarPorId(id: string): Promise<Conteudo | null>;

    /**
     * Lista os conteúdos associados a um gênero específico.
     *
     * @param genero - Identificador do gênero.
     * @returns Um array com os conteúdos associados ao gênero informado.
     */
    buscarPorGenero(genero: string): Promise<Conteudo[]>;


    /**
     * Cria e persiste um novo conteúdo.
     *
     * @param filme - Dados do conteúdo a ser criado.
     * @returns O conteúdo recém-criado.
     */
    criar(filme: Conteudo): Promise<Conteudo>;

    /**
     * Atualiza os dados de um conteúdo existente.
     *
     * @param id - Identificador do conteúdo a ser atualizado.
     * @param filme - Novos dados do conteúdo.
     * @returns O conteúdo atualizado, ou `null` caso o `id` não seja encontrado.
     */

    atualizar(id: string, filme: Conteudo): Promise<Conteudo | null>;


    /**
     * Remove um conteúdo pelo seu identificador.
     *
     * RNLF21 - a remoção pode ser restringida caso o conteúdo esteja associado
     * a outros registros dependentes (ex: gêneros, avaliações ou favoritos),
     * dependendo da implementação.
     *
     * @param id - Identificador do conteúdo a ser removido.
     * @returns `true` caso o conteúdo tenha sido removido, `false` caso não exista.
     */
    remover(id: string): Promise<boolean>;


}