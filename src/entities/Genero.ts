// Entidade Genero: categorias usadas pelos filmes (gênero principal e sub-gêneros).
// RNLF20 (unicidade de nome) e RNLF21 (não pode ser removido se estiver em uso)
// dependem da coleção completa e por isso são aplicadas no GeneroRepository.

/**
 * Formato bruto de {@link Genero} utilizado para persistência em JSON.
 */
export interface GeneroJSON {
    id: string;
    nome: string;
    descricao: string;
    ativo: boolean;
}

/**
 * Entidade que representa um gênero de filme/conteúdo, utilizado como
 * categoria principal ou sub-gênero.
 *
 * As regras de unicidade de nome (RNLF20) e restrição de remoção quando em
 * uso (RNLF21) dependem da coleção completa de gêneros, por isso são
 * aplicadas no `GeneroRepository`, não nesta entidade.
 */
export class Genero {
    private readonly _id: string;
    private _nome: string;
    private _descricao: string;
    private _ativo: boolean;

    constructor(params: { id: string; nome: string; descricao?: string; ativo?: boolean }) {
        Genero.validarNome(params.nome);

        this._id = params.id;
        this._nome = params.nome.trim();
        this._descricao = params.descricao?.trim() ?? '';
        this._ativo = params.ativo ?? true;
    }

     /**
     * Cria uma nova instância de {@link Genero}, validando o nome.
     *
     * @param params - Dados do gênero.
     * @param params.id - Identificador único do gênero.
     * @param params.nome - Nome do gênero (mínimo 2 caracteres, é normalizado com `trim`).
     * @param params.descricao - Descrição do gênero. Padrão: string vazia.
     * @param params.ativo - Indica se o gênero está ativo. Padrão: `true`.
     * @throws {Error} Caso o nome seja inválido.
     */
    
 /** Identificador único do gênero. */
    get id() { return this._id; }
 /** Nome do gênero. */
    get nome() { return this._nome; }
 /** Descrição do gênero. */
    get descricao() { return this._descricao; }
 /** Indica se o gênero está ativo. */
    get ativo() { return this._ativo; }


     /**
     * Nome normalizado (sem espaços, em minúsculas), usado pelo repositório
     * para comparar nomes ignorando maiúsculas/minúsculas (RNLF20).
     */
    // Usado pelo repositório para comparar nomes ignorando maiúsculas/minúsculas (RNLF20)
    get nomeNormalizado(): string {
        return this._nome.trim().toLowerCase();
    }

     /**
     * Atualiza o nome do gênero, validando o novo valor.
     * @throws {Error} Caso o nome seja inválido (menor que 2 caracteres).
     */
    set nome(nome: string) {
        Genero.validarNome(nome);
        this._nome = nome.trim();
    }

    /**
     * Atualiza a descrição do gênero.
     */
    set descricao(descricao: string) {
        this._descricao = descricao?.trim() ?? '';
    }

     /**
     * Atualiza o status de ativação do gênero.
     */
    set ativo(ativo: boolean) {
        this._ativo = ativo;
    }

     /**
     * Valida se o nome atende ao tamanho mínimo exigido.
     * @throws {Error} Caso o nome seja vazio ou tenha menos de 2 caracteres.
     */
    private static validarNome(nome: string): void {
        if (!nome || nome.trim().length < 2) {
            throw new Error('O nome do gênero deve ter no mínimo 2 caracteres.');
        }
    }

      /**
     * Valida se um valor desconhecido possui o formato de {@link GeneroJSON}.
     * @throws {Error} Caso algum campo obrigatório esteja ausente ou em formato inválido.
     */
    private static validarJSON(data: unknown): asserts data is GeneroJSON {
        if (typeof data !== 'object' || data === null) {
            throw new Error('JSON inválido: esperado um objeto.');
        }

        const obj = data as Record<string, unknown>;

        if (typeof obj.id !== 'string') {
            throw new Error('Campo "id" é obrigatório e deve ser uma string.');
        }
        if (typeof obj.nome !== 'string') {
            throw new Error('Campo "nome" é obrigatório e deve ser uma string.');
        }
        if (obj.descricao !== undefined && typeof obj.descricao !== 'string') {
            throw new Error('Campo "descricao", quando informado, deve ser uma string.');
        }
        if (typeof obj.ativo !== 'boolean') {
            throw new Error('Campo "ativo" é obrigatório e deve ser booleano.');
        }

        Genero.validarNome(obj.nome as string);
    }

      /**
     * Cria uma instância de {@link Genero} a partir de dados brutos (objeto ou string JSON).
     *
     * @param data - Dados no formato {@link GeneroJSON}, como objeto ou string JSON.
     * @returns Uma nova instância de {@link Genero}.
     * @throws {Error} Caso os dados não correspondam ao formato esperado de {@link GeneroJSON}.
     */
    static fromJSON(data: unknown): Genero {
        const parsed: unknown = typeof data === 'string' ? JSON.parse(data) : data;

        Genero.validarJSON(parsed);

        return new Genero({
            id: parsed.id,
            nome: parsed.nome,
            descricao: parsed.descricao,
            ativo: parsed.ativo,
        });
    }

      /**
     * Serializa a instância para o formato {@link GeneroJSON}.
     *
     * @returns Os dados do gênero no formato {@link GeneroJSON}.
     */
    toJSON(): GeneroJSON {
        return {
            id: this._id,
            nome: this._nome,
            descricao: this._descricao,
            ativo: this._ativo,
        };
    }
}
