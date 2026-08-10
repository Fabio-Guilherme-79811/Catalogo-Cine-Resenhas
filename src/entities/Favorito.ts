// Entidade Favorito: relação entre um usuário e um filme salvo por ele.
// A regra de não duplicar o mesmo favorito para o mesmo usuário/filme
// é aplicada no FavoritoRepository, pois depende da coleção completa.

/**
 * Representa a estrutura JSON de um favorito.
 */
export interface FavoritoJSON {
    id: string;
    usuarioId: string;
    filmeId: string;
    adicionadoEm: string;
}

/**
 * Representa a relação entre um usuário e um filme favoritado.
 *
 * A validação para impedir favoritos duplicados
 * (mesmo usuário favoritando o mesmo filme mais de uma vez)
 * deve ser realizada no repositório.
 */
export class Favorito {
    private readonly _id: string;
    private readonly _usuarioId: string;
    private readonly _filmeId: string;
    private readonly _adicionadoEm: string;

     /**
     * Cria uma nova instância de Favorito.
     *
     * @param params Dados necessários para criar um favorito.
     * @param params.id Identificador único do favorito.
     * @param params.usuarioId Identificador do usuário.
     * @param params.filmeId Identificador do filme.
     * @param params.adicionadoEm Data em que o favorito foi criado.
     * Caso não seja informada, será utilizada a data e hora atual.
     *
     * @throws Error Se o identificador do usuário ou do filme for inválido.
     */
    constructor(params: { id: string; usuarioId: string; filmeId: string; adicionadoEm?: string }) {
        Favorito.validarUsuarioId(params.usuarioId);
        Favorito.validarFilmeId(params.filmeId);

        this._id = params.id;
        this._usuarioId = params.usuarioId;
        this._filmeId = params.filmeId;
        this._adicionadoEm = params.adicionadoEm ?? new Date().toISOString();
    }

    /** Identificador do favorito. */
    get id() { return this._id; }
    /** Identificador do usuário. */
    get usuarioId() { return this._usuarioId; }
    /** Identificador do filme. */
    get filmeId() { return this._filmeId; }
      /** Data de criação do favorito em formato ISO 8601. */
    get adicionadoEm() { return this._adicionadoEm; }


    /**
     * Valida o identificador do usuário.
     *
     * @param usuarioId Identificador do usuário.
     * @throws Error Se o identificador for vazio ou inválido.
     */
    private static validarUsuarioId(usuarioId: string): void {
        if (!usuarioId || String(usuarioId).trim().length === 0) {
            throw new Error('O usuário é obrigatório para favoritar um filme.');
        }
    }

     /**
     * Valida o identificador do filme.
     *
     * @param filmeId Identificador do filme.
     * @throws Error Se o identificador for vazio ou inválido.
     */
    private static validarFilmeId(filmeId: string): void {
        if (!filmeId || String(filmeId).trim().length === 0) {
            throw new Error('O filme é obrigatório para ser favoritado.');
        }
    }

      /**
     * Valida se um objeto possui o formato esperado de {@link FavoritoJSON}.
     *
     * @param data Objeto a ser validado.
     * @throws Error Se o objeto não possuir a estrutura esperada.
     */
    private static validarJSON(data: unknown): asserts data is FavoritoJSON {
        if (typeof data !== 'object' || data === null) {
            throw new Error('JSON inválido: esperado um objeto.');
        }

        const obj = data as Record<string, unknown>;

        const camposString: (keyof FavoritoJSON)[] = ['id', 'usuarioId', 'filmeId', 'adicionadoEm'];
        for (const campo of camposString) {
            if (typeof obj[campo] !== 'string') {
                throw new Error(`Campo "${campo}" é obrigatório e deve ser uma string.`);
            }
        }
    }

     /**
     * Cria uma instância de {@link Favorito} a partir de um objeto ou de uma
     * string JSON.
     *
     * @param data Objeto ou string JSON contendo os dados do favorito.
     * @returns Uma nova instância de {@link Favorito}.
     *
     * @throws Error Se o JSON for inválido ou não possuir a estrutura esperada.
     */
    static fromJSON(data: unknown): Favorito {
        const parsed: unknown = typeof data === 'string' ? JSON.parse(data) : data;

        Favorito.validarJSON(parsed);

        return new Favorito({
            id: parsed.id,
            usuarioId: parsed.usuarioId,
            filmeId: parsed.filmeId,
            adicionadoEm: parsed.adicionadoEm,
        });
    }

        /**
     * Converte a instância para um objeto compatível com JSON.
     *
     * @returns Representação do favorito em formato {@link FavoritoJSON}.
     */
    toJSON(): FavoritoJSON {
        return {
            id: this._id,
            usuarioId: this._usuarioId,
            filmeId: this._filmeId,
            adicionadoEm: this._adicionadoEm,
        };
    }
}
