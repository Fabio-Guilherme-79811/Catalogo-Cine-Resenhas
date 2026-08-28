// Define o formato esperado de um Conteudo quando representado como JSON puro
/**
 * Representa a estrutura JSON de um conteúdo.
 */
export interface ConteudoJSON {
  /** Identificador único do conteúdo. */
  id: string | number;

  /** Título do conteúdo. */
  titulo: string;

  /** Sinopse do conteúdo. */
  sinopse: string;

  /** URL da capa do conteúdo. */
  capaUrl: string;

  /** Identificador do gênero principal. */
  generoId: string | number;

  /** Lista de identificadores dos subgêneros. */
  subGenerosIds: (string | number)[];

  /** Ano de lançamento do conteúdo. */
  anoLancamento: number;

  /** Nome do diretor. */
  diretor: string;

  /** Tipo do conteúdo (Filme, Série etc.). */
  tipo: string;

  /** Duração em minutos. */
  duracao: number;

  /** Direção do arquivo ou categoria utilizada pelo sistema. */
  direcao: string;

  /** Avaliação média do conteúdo. */
  avaliacao?: number;
}

/**
 * Representa um conteúdo disponível no catálogo.
 */
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

  /**
   * Cria uma nova instância de Conteudo.
   *
   * @param params Dados necessários para criar o conteúdo.
   * @param params.id Identificador único.
   * @param params.titulo Título do conteúdo.
   * @param params.sinopse Sinopse do conteúdo.
   * @param params.capaUrl URL da imagem de capa.
   * @param params.generoId Identificador do gênero principal.
   * @param params.subGenerosIds Lista de identificadores dos subgêneros.
   * @param params.anoLancamento Ano de lançamento.
   * @param params.diretor Nome do diretor.
   * @param params.tipo Tipo do conteúdo.
   * @param params.duracao Duração em minutos.
   * @param params.direcao Direção do conteúdo.
   * @param params.avaliacao Avaliação média do conteúdo.
   *
   * @throws Error Se o título ou o ano de lançamento forem inválidos.
   */
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

  /** Identificador do conteúdo. */
  get id() {
    return this._id;
  }

  /** Sinopse do conteúdo. */
  get sinopse() {
    return this._sinopse;
  }

  /** URL da capa do conteúdo. */
  get capaUrl() {
    return this._capaUrl;
  }

  /** Identificador do gênero principal. */
  get generoId() {
    return this._generoId;
  }

  /** Lista de identificadores dos subgêneros. */
  get subGenerosIds() {
    return this._subGenerosIds;
  }

  /** Tipo do conteúdo. */
  get tipo() {
    return this._tipo;
  }

  /** Direção do conteúdo. */
  get direcao() {
    return this._direcao;
  }

  /** Título do conteúdo. */
  get titulo() {
    return this._titulo;
  }

  /** Ano de lançamento. */
  get anoLancamento() {
    return this._anoLancamento;
  }

  /** Diretor do conteúdo. */
  get diretor() {
    return this._diretor;
  }

  /** Duração em minutos. */
  get duracao() {
    return this._duracao;
  }

  /** Avaliação média do conteúdo. */
  get avaliacao() {
    return this._avaliacao;
  }

  /**
   * Atualiza o título do conteúdo.
   *
   * @param titulo Novo título.
   * @throws Error Se o título for inválido.
   */
  set titulo(titulo: string) {
    Conteudo.validarTitulo(titulo);
    this._titulo = titulo;
  }

  /**
   * Atualiza o ano de lançamento.
   *
   * @param anoLancamento Novo ano de lançamento.
   * @throws Error Se o ano informado for inválido.
   */
  set anoLancamento(anoLancamento: number) {
    Conteudo.validarAnoLancamento(anoLancamento);
    this._anoLancamento = anoLancamento;
  }

  /**
   * Valida o título do conteúdo.
   *
   * @param titulo Título a ser validado.
   * @throws Error Se o título estiver vazio.
   */
  private static validarTitulo(titulo: string) {
    if (!titulo || titulo.trim().length === 0) {
      throw new Error('O titulo do filme é obrigatório.');
    }
  }

  /**
   * Valida o ano de lançamento.
   *
   * @param ano Ano a ser validado.
   * @throws Error Se o ano estiver fora do intervalo permitido.
   */
  private static validarAnoLancamento(ano: number) {
    const anoAtual = new Date().getFullYear();
    if (!ano || ano < 1888 || ano > anoAtual + 5) {
      throw new Error('Ano de lançamento inválido.');
    }
  }

  /**
   * Valida se um objeto possui a estrutura esperada de {@link ConteudoJSON}.
   *
   * @param data Objeto a ser validado.
   * @throws Error Se o objeto não possuir a estrutura esperada.
   */
  private static validarJSON(data: unknown): asserts data is ConteudoJSON {
    if (typeof data !== 'object' || data === null) {
      throw new Error('JSON inválido: esperado um objeto.');
    }

    const obj = data as Record<string, unknown>;

    const camposString: (keyof ConteudoJSON)[] = [
      'titulo',
      'sinopse',
      'capaUrl',
      'diretor',
      'tipo',
      'direcao',
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

  /**
   * Cria uma instância de {@link Conteudo} a partir de um objeto ou de uma
   * string JSON.
   *
   * @param data Objeto ou string JSON.
   * @returns Uma nova instância de {@link Conteudo}.
   *
   * @throws Error Se o JSON for inválido.
   */
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

  /**
   * Converte a instância para um objeto compatível com JSON.
   *
   * @returns Representação do conteúdo em formato {@link ConteudoJSON}.
   */
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

export { Conteudo };
