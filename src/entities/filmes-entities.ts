// Formato esperado do JSON que representa um Conteudo
// Formato esperado do JSON que representa um Conteudo
/**
 * Formato bruto de {@link Conteudo} utilizado para persistência/serialização em JSON.
 */
interface ConteudoJSON {
    id: string;
    titulo: string;
    sinopse: string;
    capaUrl: string;
    genero: string | number;
    anoLancamento: number;
    diretor: string;
    tipo: string;
    duracao: number;
    direcao: string;
    avaliacao?: number;
}

/**
 * Entidade que representa um conteúdo (filme/série) do catálogo.
 */
class Conteudo {
    private readonly _id: string | number;
    private _titulo: string;
    private _sinopse: string;
    private _capaUrl: string;
    private _genero: string | number;
    private _anoLancamento: number;
    private _diretor: string;
    private _tipo: string;
    private _duracao: number;
    private _direcao: string;
    private _avaliacao: number;

     /**
     * Cria uma nova instância de {@link Conteudo}, validando título e ano de lançamento.
     *
     * @param params - Dados do conteúdo.
     * @param params.id - Identificador único do conteúdo.
     * @param params.titulo - Título do conteúdo (não pode ser vazio).
     * @param params.sinopse - Sinopse do conteúdo.
     * @param params.capaUrl - URL da imagem de capa.
     * @param params.genero - Identificador do gênero (string ou número).
     * @param params.anoLancamento - Ano de lançamento (entre 1888 e o ano atual + 5).
     * @param params.diretor - Nome do diretor.
     * @param params.tipo - Tipo do conteúdo (ex: filme, série).
     * @param params.duracao - Duração, em minutos.
     * @param params.direcao - Direção do conteúdo.
     * @param params.avaliacao - Avaliação/nota do conteúdo. Padrão: `0`.
     * @throws {Error} Caso o título seja vazio ou o ano de lançamento seja inválido.
     */
    constructor(params: {
        id: string;
        sinopse: string;
        capaUrl: string;
        genero: string | number;
        tipo: string;
        direcao: string;
        titulo: string;
        anoLancamento: number;
        diretor: string;
        duracao: number;
        avaliacao: number;
    }) {
        Conteudo.validarTitulo(params.titulo);
        Conteudo.validarAnoLancamento(params.anoLancamento);

        this._id = params.id;
        this._sinopse = params.sinopse;
        this._capaUrl = params.capaUrl;
        this._genero = params.genero;
        this._tipo = params.tipo;
        this._direcao = params.direcao;
        this._titulo = params.titulo;
        this._anoLancamento = params.anoLancamento;
        this._diretor = params.diretor;
        this._duracao = params.duracao;
        this._avaliacao = params.avaliacao ?? 0;
    }

    /** Identificador único do conteúdo. */
    get id() { return this._id; }
    /** Sinopse do conteúdo. */
    get sinopse() { return this._sinopse; }
    /** URL da imagem de capa. */
    get capaUrl() { return this._capaUrl; }
    /** Identificador do gênero associado. */
    get genero() { return this._genero; }
    /** Tipo do conteúdo (ex: filme, série). */
    get tipo() { return this._tipo; }
    /** Direção do conteúdo. */
    get direcao() { return this._direcao; }
    /** Título do conteúdo. */
    get titulo() { return this._titulo; }
    /** Ano de lançamento do conteúdo. */
    get anoLancamento() { return this._anoLancamento; }
    /** Nome do diretor. */
    get diretor() { return this._diretor; }
    /** Duração, em minutos. */
    get duracao() { return this._duracao; }
    /** Avaliação/nota do conteúdo. */
    get avaliacao() { return this._avaliacao; }

    /**
     * Atualiza o título do conteúdo, validando o novo valor.
     * @throws {Error} Caso o título seja vazio.
     */
    set titulo(titulo: string) {
        Conteudo.validarTitulo(titulo);
        this._titulo = titulo; // antes chamava o próprio setter (loop infinito)
    }

     /**
     * Atualiza o ano de lançamento do conteúdo, validando o novo valor.
     * @throws {Error} Caso o ano seja inválido (fora do intervalo permitido).
     */
    set anoLancamento(anoLancamento: number) {
        Conteudo.validarAnoLancamento(anoLancamento);
        this._anoLancamento = anoLancamento; // antes chamava o próprio setter (loop infinito)
    }

     /**
     * Valida se o título foi informado e não é vazio.
     * @throws {Error} Caso o título seja vazio ou não informado.
     */
    private static validarTitulo(titulo: string) {
        if (!titulo || titulo.trim().length === 0) {
            throw new Error('O titulo do filme é obrigatório.');
        }
    }

       /**
     * Valida se o ano de lançamento está dentro do intervalo permitido
     * (entre 1888 e o ano atual + 5).
     * @throws {Error} Caso o ano seja inválido.
     */
    private static validarAnoLancamento(ano: number) {
        const anoAtual = new Date().getFullYear();
        if (!ano || ano < 1888 || ano > anoAtual + 5) {
            throw new Error('Ano de lançamento inválido.');
        }
    }

    /**
     * Valida se um objeto/JSON bruto tem o formato e os tipos esperados
     * para se transformar em um Conteudo. Lança erro descrevendo o problema
     * caso algo esteja inválido ou faltando.
     */
    private static validarJSON(data: unknown): asserts data is ConteudoJSON {
        if (typeof data !== 'object' || data === null) {
            throw new Error('JSON inválido: esperado um objeto.');
        }

        const obj = data as Record<string, unknown>;

        const camposString: (keyof ConteudoJSON)[] = [
            'id', 'titulo', 'sinopse', 'capaUrl', 'diretor', 'tipo', 'direcao',
        ];
        for (const campo of camposString) {
            if (typeof obj[campo] !== 'string') {
                throw new Error(`Campo "${campo}" é obrigatório e deve ser uma string.`);
            }
        }

        if (typeof obj.genero !== 'string' && typeof obj.genero !== 'number') {
            throw new Error('Campo "genero" é obrigatório e deve ser string ou número.');
        }

        if (typeof obj.anoLancamento !== 'number') {
            throw new Error('Campo "anoLancamento" é obrigatório e deve ser numérico.');
        }

        if (typeof obj.duracao !== 'number') {
            throw new Error('Campo "duracao" é obrigatório e deve ser numérico.');
        }

        if (obj.avaliacao !== undefined && typeof obj.avaliacao !== 'number') {
            throw new Error('Campo "avaliacao", quando informado, deve ser numérico.');
        }

        // Reaproveita as mesmas regras de negócio do construtor
        Conteudo.validarTitulo(obj.titulo as string);
        Conteudo.validarAnoLancamento(obj.anoLancamento as number);
    }

    /**
     * Cria uma instância de Conteudo a partir de um JSON (string ou objeto já parseado),
     * validando estrutura, tipos e regras de negócio antes de instanciar.
     */
    static fromJSON(data: unknown): Conteudo {
        const parsed: unknown = typeof data === 'string' ? JSON.parse(data) : data;

        Conteudo.validarJSON(parsed);

        return new Conteudo({
            id: parsed.id,
            titulo: parsed.titulo,
            sinopse: parsed.sinopse,
            capaUrl: parsed.capaUrl,
            genero: parsed.genero,
            anoLancamento: parsed.anoLancamento,
            diretor: parsed.diretor,
            tipo: parsed.tipo,
            duracao: parsed.duracao,
            direcao: parsed.direcao,
            avaliacao: parsed.avaliacao ?? 0,
        });
    }

    /**
     * Serializa a instância para um objeto simples (usado automaticamente
     * por JSON.stringify).
     */
    toJSON(): ConteudoJSON {
        return {
            id: String(this._id),
            titulo: this._titulo,
            sinopse: this._sinopse,
            capaUrl: this._capaUrl,
            genero: this._genero,
            anoLancamento: this._anoLancamento,
            diretor: this._diretor,
            tipo: this._tipo,
            duracao: this._duracao,
            direcao: this._direcao,
            avaliacao: this._avaliacao,
        };
    }
}

export { Conteudo, ConteudoJSON };