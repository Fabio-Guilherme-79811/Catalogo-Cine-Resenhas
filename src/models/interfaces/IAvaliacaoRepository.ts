import { Avaliacao } from '../../entities/Avaliacao';

/**
 * Contrato de persistência para a entidade {@link Avaliacao}.
 *
 * Define as operações que qualquer repositório de avaliações deve implementar,
 * independentemente do mecanismo de armazenamento utilizado (JSON em disco,
 * banco de dados, etc).
 */
export interface IAvaliacaoRepository {

    /**
     * Lista todas as avaliações cadastradas, de todos os usuários e filmes.
     *
     * @returns Um array com todas as avaliações persistidas.
     */
    listarTodas(): Promise<Avaliacao[]>;

    /**
     * Busca uma avaliação pelo seu identificador único.
     *
     * @param id - Identificador da avaliação.
     * @returns A avaliação correspondente, ou `null` caso não seja encontrada.
     */
    buscarPorId(id: string): Promise<Avaliacao | null>;

    /**
     * Lista todas as avaliações de um filme específico.
     *
     * @param filmeId - Identificador do filme.
     * @returns Um array com as avaliações pertencentes ao filme informado.
     */
    listarPorFilme(filmeId: string): Promise<Avaliacao[]>;


    /**
     * Busca a avaliação de um usuário para um filme específico.
     *
     * RNLF31 - localiza a avaliação já existente de um usuário para um filme,
     * garantindo no máximo uma avaliação por par usuário/filme.
     *
     * @param usuarioId - Identificador do usuário.
     * @param filmeId - Identificador do filme.
     * @returns A avaliação correspondente, ou `null` caso não exista.
     */
    buscarPorUsuarioEFilme(usuarioId: string, filmeId: string): Promise<Avaliacao | null>;


    /**
     * Cria uma nova avaliação ou atualiza a avaliação existente de um usuário
     * para um filme.
     *
     * RNLF31 - se o usuário já avaliou o filme, a avaliação existente deve ser
     * atualizada em vez de uma nova ser criada, mantendo o `id` e a data de
     * criação originais.
     *
     * @param avaliacao - Dados da avaliação a ser criada ou atualizada.
     * @returns A avaliação criada ou atualizada.
     */
    criarOuAtualizar(avaliacao: Avaliacao): Promise<Avaliacao>;


    /**
     * Remove uma avaliação pelo seu identificador.
     *
     * @param id - Identificador da avaliação a ser removida.
     * @returns `true` caso a avaliação tenha sido removida, `false` caso não exista.
     */
    remover(id: string): Promise<boolean>;

    /**
     * Calcula a média das notas de um filme.
     *
     * RNLF33 - média calculada dinamicamente: soma de todas as notas dividida
     * pela quantidade total de avaliações do filme, arredondada para uma casa decimal.
     *
     * @param filmeId - Identificador do filme.
     * @returns A média das notas, arredondada para uma casa decimal, ou `0` caso
     * o filme não possua avaliações.
     */
    calcularMediaDoFilme(filmeId: string): Promise<number>;


}
