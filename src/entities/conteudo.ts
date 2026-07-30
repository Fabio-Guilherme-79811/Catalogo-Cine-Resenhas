// Define o formato esperado de um Conteudo quando representado como JSON puro
export interface ConteudoJSON {
    id: string | number;
    titulo: string;
    sinopse: string;
    capaUrl: string;
    generoId: string | number;
    subGenerosIds: (string | number)[];
    anoLancamento: number;
    diretor: string;
    tipo: string;
    duracao: number;
    direcao: string;
    avaliacao?: number;
}

class Conteudo {
    private readonly _id: string | number;
    private _titulo: string;
    private _sinopse: string;
    private _capaUrl: string;
    private _generoId: string | number;
    private _subGenerosIds: (string | number)[];
    private _anoLancamento: number;
    private _diretor: string;
    private _tipo: string;
    private _duracao: number;
    private _direcao: string;
    private _avaliacao: number;

    constructor(params: {
        id: string | number;
        sinopse: string;
        capaUrl: string;
        generoId: string | number;
        subGenerosIds: (string | number)[];
        tipo: string;
        direcao: string;
        titulo: string;
        anoLancamento: number;
        diretor: string;
        duracao: number;
        avaliacao?: number;
    }) {
        Conteudo.validarTitulo(params.titulo);
        Conteudo.validarAnoLancamento(params.anoLancamento);

        this._id = params.id;
        this._sinopse = params.sinopse;
        this._capaUrl = params.capaUrl;
        this._generoId = params.generoId;
        this._subGenerosIds = params.subGenerosIds;
        this._tipo = params.tipo;
        this._direcao = params.direcao;
        this._titulo = params.titulo;
        this._anoLancamento = params.anoLancamento;
        this._diretor = params.diretor;
        this._duracao = params.duracao;
        this._avaliacao = params.avaliacao ?? 0;
    }

    // Getters
    get id() { return this._id; }
    get sinopse() { return this._sinopse; }
    get capaUrl() { return this._capaUrl; }
    get generoId() { return this._generoId; }
    get subGenerosIds() { return this._subGenerosIds; }
    get tipo() { return this._tipo; }
    get direcao() { return this._direcao; }
    get titulo() { return this._titulo; }
    get anoLancamento() { return this._anoLancamento; }
    get diretor() { return this._diretor; }
    get duracao() { return this._duracao; }
    get avaliacao() { return this._avaliacao; }

    // Setters com validações
    set titulo(titulo: string) {
        Conteudo.validarTitulo(titulo);
        this._titulo = titulo; 
    }

    set anoLancamento(anoLancamento: number) {
        Conteudo.validarAnoLancamento(anoLancamento);
        this._anoLancamento = anoLancamento; 
    }

    // Validações internas
    private static validarTitulo(titulo: string) {
        if (!titulo || titulo.trim().length === 0) {
            throw new Error('O titulo do filme é obrigatório.');
        }
    }

    private static validarAnoLancamento(ano: number) {
        const anoAtual = new Date().getFullYear();
        if (!ano || ano < 1888 || ano > anoAtual + 5) {
            throw new Error('Ano de lançamento inválido.');
        }
    }

    private static validarJSON(data: unknown): asserts data is ConteudoJSON {
        if (typeof data !== 'object' || data === null) {
            throw new Error('JSON inválido: esperado um objeto.');
        }

        const obj = data as Record<string, unknown>;

        const camposString: (keyof ConteudoJSON)[] = [
            'titulo', 'sinopse', 'capaUrl', 'diretor', 'tipo', 'direcao',
        ];
        
        for (const campo of camposString) {
            if (typeof obj[campo] !== 'string') {
                throw new Error(`Campo "${campo}" é obrigatório e deve ser uma string.`);
            }
        }

        if (typeof obj.id !== 'string' && typeof obj.id !== 'number') {
            throw new Error('Campo "id" é obrigatório e deve ser string ou número.');
        }

        if (typeof obj.generoId !== 'string' && typeof obj.generoId !== 'number') {
            throw new Error('Campo "generoId" é obrigatório e deve ser string ou número.');
        }

        if (!Array.isArray(obj.subGenerosIds)) {
            throw new Error('Campo "subGenerosIds" é obrigatório e deve ser um array.');
        }
        for (const sub of obj.subGenerosIds) {
            if (typeof sub !== 'string' && typeof sub !== 'number') {
                throw new Error('Cada item de "subGenerosIds" deve ser string ou número.');
            }
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

        Conteudo.validarTitulo(obj.titulo as string);
        Conteudo.validarAnoLancamento(obj.anoLancamento as number);
    }

    static fromJSON(data: unknown): Conteudo {
        const parsed: unknown = typeof data === 'string' ? JSON.parse(data) : data;
        Conteudo.validarJSON(parsed);

        return new Conteudo({
            id: parsed.id,
            titulo: parsed.titulo,
            sinopse: parsed.sinopse,
            capaUrl: parsed.capaUrl,
            generoId: parsed.generoId,
            subGenerosIds: parsed.subGenerosIds,
            anoLancamento: parsed.anoLancamento,
            diretor: parsed.diretor,
            tipo: parsed.tipo,
            duracao: parsed.duracao,
            direcao: parsed.direcao,
            avaliacao: parsed.avaliacao,
        });
    }

    toJSON(): ConteudoJSON {
        return {
            id: String(this._id),
            titulo: this._titulo,
            sinopse: this._sinopse,
            capaUrl: this._capaUrl,
            generoId: this._generoId,
            subGenerosIds: this._subGenerosIds,
            anoLancamento: this._anoLancamento,
            diretor: this._diretor,
            tipo: this._tipo,
            duracao: this._duracao,
            direcao: this._direcao,
            avaliacao: this._avaliacao,
        };
    }
}

export { Conteudo,};