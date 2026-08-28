// Entidade Avaliacao: nota + comentário de um usuário sobre um filme.
// RNLF30 (intervalo/precisão da nota) é validada aqui, pois só depende do próprio valor.
// RNLF31 (unicidade por usuário/filme) e RNLF33 (cálculo da média) dependem da
// coleção completa e por isso ficam no AvaliacaoRepository.
/**
 * Representa a estrutura JSON de uma avaliação.
 */
export interface AvaliacaoJSON {
  /** Identificador único da avaliação. */
  id: string;

  /** Identificador do filme avaliado. */
  filmeId: string;

  /** Identificador do usuário que realizou a avaliação. */
  usuarioId: string;

  /** Nota atribuída ao filme. */
  nota: number;

  /** Comentário opcional sobre o filme. */
  comentario: string;

  /** Data de criação da avaliação em formato ISO 8601. */
  dataCriacao: string;
}

/**
 * Representa a avaliação realizada por um usuário para um filme.
 *
 * A validação da nota é realizada nesta entidade, enquanto regras que
 * dependem do conjunto de avaliações, como impedir avaliações duplicadas
 * e calcular a média das notas, são responsabilidade do repositório.
 */
export class Avaliacao {
  private readonly _id: string;
  private readonly _filmeId: string;
  private readonly _usuarioId: string;
  private _nota: number;
  private _comentario: string;
  private readonly _dataCriacao: string;

  /**
   * Cria uma nova instância de Avaliacao.
   *
   * @param params Dados necessários para criar a avaliação.
   * @param params.id Identificador único da avaliação.
   * @param params.filmeId Identificador do filme avaliado.
   * @param params.usuarioId Identificador do usuário avaliador.
   * @param params.nota Nota atribuída ao filme.
   * @param params.comentario Comentário opcional sobre o filme.
   * @param params.dataCriacao Data de criação da avaliação.
   * Caso não seja informada, será utilizada a data e hora atual.
   *
   * @throws Error Se o filme, usuário ou nota forem inválidos.
   */
  constructor(params: {
    id: string;
    filmeId: string;
    usuarioId: string;
    nota: number;
    comentario?: string;
    dataCriacao?: string;
  }) {
    Avaliacao.validarFilmeId(params.filmeId);
    Avaliacao.validarUsuarioId(params.usuarioId);
    Avaliacao.validarNota(params.nota);

    this._id = params.id;
    this._filmeId = params.filmeId;
    this._usuarioId = params.usuarioId;
    this._nota = params.nota;
    this._comentario = params.comentario?.trim() ?? '';
    this._dataCriacao = params.dataCriacao ?? new Date().toISOString();
  }

  /** Identificador da avaliação. */
  get id() {
    return this._id;
  }

  /** Identificador do filme avaliado. */
  get filmeId() {
    return this._filmeId;
  }

  /** Identificador do usuário avaliador. */
  get usuarioId() {
    return this._usuarioId;
  }

  /** Nota atribuída ao filme. */
  get nota() {
    return this._nota;
  }

  /** Comentário da avaliação. */
  get comentario() {
    return this._comentario;
  }

  /** Data de criação da avaliação. */
  get dataCriacao() {
    return this._dataCriacao;
  }

  /**
   * Atualiza a nota da avaliação.
   *
   * @param nota Nova nota.
   * @throws Error Se a nota for inválida.
   */
  set nota(nota: number) {
    Avaliacao.validarNota(nota);
    this._nota = nota;
  }

  /**
   * Atualiza o comentário da avaliação.
   *
   * @param comentario Novo comentário.
   */
  set comentario(comentario: string) {
    this._comentario = comentario?.trim() ?? '';
  }

  /**
   * Valida a nota da avaliação.
   *
   * A nota deve estar entre 1 e 5 e possuir no máximo
   * uma casa decimal.
   *
   * @param nota Nota a ser validada.
   * @throws Error Se a nota for inválida.
   */
  private static validarNota(nota: number): void {
    if (typeof nota !== 'number' || Number.isNaN(nota)) {
      throw new Error('A nota é obrigatória e deve ser numérica.');
    }
    if (nota < 1 || nota > 5) {
      throw new Error('A nota deve estar entre 1.0 e 5.0.'); // RNLF30
    }
    const notaComUmaCasa = Math.round(nota * 10) / 10;
    if (notaComUmaCasa !== nota) {
      throw new Error('A nota deve ser um valor inteiro ou com no máximo uma casa decimal.'); // RNLF30
    }
  }

  /**
   * Valida o identificador do filme.
   *
   * @param filmeId Identificador do filme.
   * @throws Error Se o identificador for inválido.
   */
  private static validarFilmeId(filmeId: string): void {
    if (!filmeId || String(filmeId).trim().length === 0) {
      throw new Error('O filme avaliado é obrigatório.');
    }
  }

  /**
   * Valida o identificador do usuário.
   *
   * @param usuarioId Identificador do usuário.
   * @throws Error Se o identificador for inválido.
   */
  private static validarUsuarioId(usuarioId: string): void {
    if (!usuarioId || String(usuarioId).trim().length === 0) {
      throw new Error('O usuário avaliador é obrigatório.'); // RNLF32
    }
  }

  /**
   * Valida se um objeto possui a estrutura esperada de {@link AvaliacaoJSON}.
   *
   * @param data Objeto a ser validado.
   * @throws Error Se o objeto não possuir a estrutura esperada.
   */
  private static validarJSON(data: unknown): asserts data is AvaliacaoJSON {
    if (typeof data !== 'object' || data === null) {
      throw new Error('JSON inválido: esperado um objeto.');
    }

    const obj = data as Record<string, unknown>;

    const camposString: (keyof AvaliacaoJSON)[] = ['id', 'filmeId', 'usuarioId', 'dataCriacao'];
    for (const campo of camposString) {
      if (typeof obj[campo] !== 'string') {
        throw new Error(`Campo "${campo}" é obrigatório e deve ser uma string.`);
      }
    }

    if (typeof obj.nota !== 'number') {
      throw new Error('Campo "nota" é obrigatório e deve ser numérico.');
    }
    if (obj.comentario !== undefined && typeof obj.comentario !== 'string') {
      throw new Error('Campo "comentario", quando informado, deve ser uma string.');
    }
  }

  /**
   * Cria uma instância de {@link Avaliacao} a partir de um objeto ou de uma
   * string JSON.
   *
   * @param data Objeto ou string JSON contendo os dados da avaliação.
   * @returns Uma nova instância de {@link Avaliacao}.
   *
   * @throws Error Se o JSON for inválido ou não possuir a estrutura esperada.
   */
  static fromJSON(data: unknown): Avaliacao {
    const parsed: unknown = typeof data === 'string' ? JSON.parse(data) : data;

    Avaliacao.validarJSON(parsed);

    return new Avaliacao({
      id: parsed.id,
      filmeId: parsed.filmeId,
      usuarioId: parsed.usuarioId,
      nota: parsed.nota,
      comentario: parsed.comentario,
      dataCriacao: parsed.dataCriacao,
    });
  }

  /**
   * Converte a instância para um objeto compatível com JSON.
   *
   * @returns Representação da avaliação em formato {@link AvaliacaoJSON}.
   */
  toJSON(): AvaliacaoJSON {
    return {
      id: this._id,
      filmeId: this._filmeId,
      usuarioId: this._usuarioId,
      nota: this._nota,
      comentario: this._comentario,
      dataCriacao: this._dataCriacao,
    };
  }
}
