// Define o formato esperado de um Conteudo quando representado como JSON puro
// (sem os métodos da classe, só os dados).
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
    avaliacao?: number;// opcional: se não vier, assume 0
}
 // Propriedades privadas (com "_" no início) guardam o estado real do objeto.
 // O acesso externo só é feito através dos getters/setters abaixo.
class Conteudo {
    private readonly _id: string | number; // "readonly" porque o id não deve mudar após criado
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
// Construtor: recebe todos os dados necessários para criar um Conteudo.
    // Antes de atribuir qualquer valor, valida as regras de negócio.
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
         // Valida antes de atribuir, para não deixar o objeto em estado inválido
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
         // Se avaliacao não for informada (undefined), usa 0 como padrão
        this._avaliacao = params.avaliacao ?? 0;
    }
  // Getters: permitem ler cada propriedade privada de fora da classe,
    // mas sem dar acesso direto de escrita (exceto onde há um "set" correspondente).
    get id() { return this._id; }
    get sinopse() { return this._sinopse; }
    get capaUrl() { return this._capaUrl; }
    get genero() { return this._genero; }
    get tipo() { return this._tipo; }
    get direcao() { return this._direcao; }
    get titulo() { return this._titulo; }
    get anoLancamento() { return this._anoLancamento; }
    get diretor() { return this._diretor; }
    get duracao() { return this._duracao; }
    get avaliacao() { return this._avaliacao; }
// Setter do título: só atualiza se passar na validação.
    // Se a validação lançar erro, o valor antigo é mantido (não é sobrescrito).
    set titulo(titulo: string) {
        Conteudo.validarTitulo(titulo);
        this._titulo = titulo; 
    }
// Setter do ano de lançamento: mesma lógica do setter de título.
    set anoLancamento(anoLancamento: number) {
        Conteudo.validarAnoLancamento(anoLancamento);
        this._anoLancamento = anoLancamento; 
    }
// Regra de negócio: título não pode ser vazio nem conter só espaços em branco.
    // É "private static" porque é uma regra interna da classe, reutilizada
    // tanto no construtor quanto no setter e no fromJSON.
    private static validarTitulo(titulo: string) {
        if (!titulo || titulo.trim().length === 0) {
            throw new Error('O titulo do filme é obrigatório.');
        }
    }
 // Regra de negócio: ano de lançamento deve estar entre 1888 (ano do primeiro filme)
    // e o ano atual + 5 (para permitir cadastrar filmes com lançamento futuro previsto).
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
     *
     * O "asserts data is ConteudoJSON" avisa o TypeScript: se essa função
     * não lançar erro, pode confiar que "data" tem o formato de ConteudoJSON
     * a partir deste ponto do código.
     */
    private static validarJSON(data: unknown): asserts data is ConteudoJSON {
        if (typeof data !== 'object' || data === null) {
            throw new Error('JSON inválido: esperado um objeto.');
        }
  // Faz um cast para poder acessar propriedades dinamicamente
        const obj = data as Record<string, unknown>;
// Lista de campos que devem ser obrigatoriamente strings
        const camposString: (keyof ConteudoJSON)[] = [
            'id', 'titulo', 'sinopse', 'capaUrl', 'diretor', 'tipo', 'direcao',
        ]; // Percorre a lista e valida um por um
        for (const campo of camposString) {
            if (typeof obj[campo] !== 'string') {
                throw new Error(`Campo "${campo}" é obrigatório e deve ser uma string.`);
            }
        }
// "genero" aceita tanto string quanto número (ex: "Ação" ou um código numérico)
        if (typeof obj.genero !== 'string' && typeof obj.genero !== 'number') {
            throw new Error('Campo "genero" é obrigatório e deve ser string ou número.');
        }
 // anoLancamento e duracao devem ser numéricos
        if (typeof obj.anoLancamento !== 'number') {
            throw new Error('Campo "anoLancamento" é obrigatório e deve ser numérico.');
        }
// avaliacao é opcional, mas se vier, precisa ser número
        if (typeof obj.duracao !== 'number') {
            throw new Error('Campo "duracao" é obrigatório e deve ser numérico.');
        }
 // Reaproveita as mesmas regras de negócio do construtor
        if (obj.avaliacao !== undefined && typeof obj.avaliacao !== 'number') {
            throw new Error('Campo "avaliacao", quando informado, deve ser numérico.');
        }

          // Depois de validar os tipos, reaproveita as mesmas regras de negócio
        // já usadas no construtor (evita duplicar lógica)
        Conteudo.validarTitulo(obj.titulo as string);
        Conteudo.validarAnoLancamento(obj.anoLancamento as number);
    }
 /**
     * Cria uma instância de Conteudo a partir de um JSON (string ou objeto já parseado),
     * validando estrutura, tipos e regras de negócio antes de instanciar.
     */
    static fromJSON(data: unknown): Conteudo {
          // Se vier como string, faz o parse primeiro; se já vier como objeto, usa direto
        const parsed: unknown = typeof data === 'string' ? JSON.parse(data) : data;
// Valida o formato; se algo estiver errado, essa chamada já lança o erro
        Conteudo.validarJSON(parsed);
// A partir daqui o TypeScript já sabe que "parsed" é um ConteudoJSON válido,
        // graças ao "asserts" da função validarJSON
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
     * por JSON.stringify, já que o nome "toJSON" é reconhecido pelo JS nativo).
     */
    toJSON(): ConteudoJSON {
        return {
            id: String(this._id),// garante que o id sempre saia como string
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