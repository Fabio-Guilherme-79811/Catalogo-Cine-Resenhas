class Conteudo {
    private readonly _id: string|number;
    private _titulo: string;
    private _sinopse: string;
    private _capaUrl: string;
    private _genero: string|number;
    private _anoLancamento: number;
    private _diretor: string;
    private _tipo:string;
    private _duracao: number;
    private _direcao: string;
    private _avaliacao: number;
    
    constructor(params: {
        id: string;
        sinopse: string;
        capaUrl: string;
        genero: string|number;
        tipo: string;
        direcao: string;
        titulo: string;
        anoLancamento: number;
        diretor: string;
        duracao: number;
        avaliacao: number;
    }) {
        this.validarTitulo(params.titulo);
        this.validarAnoLancamento(params.anoLancamento);

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

    get id() { return this._id; }
    get titulo() { return this._titulo; }
    get anoLancamento() { return this._anoLancamento; }
    get diretor() { return this._diretor; }
    get duracao() { return this._duracao; }
    get avaliacao() { return this._avaliacao; }

    set titulo(titulo: string){
        this.validarTitulo(titulo);
        this.titulo = titulo;
    }

    set anoLancamento(anoLancamento: number){
        this.validarAnoLancamento(anoLancamento);
        this.anoLancamento = anoLancamento
    }

    private validarTitulo(titulo: string) {
        if (!titulo || titulo.trim() .length === 0) {
            throw new Error('O titulo do filme é obrigatório.')
        }
    }

}