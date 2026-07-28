// Entidade Avaliacao: nota + comentário de um usuário sobre um filme.
// RNLF30 (intervalo/precisão da nota) é validada aqui, pois só depende do próprio valor.
// RNLF31 (unicidade por usuário/filme) e RNLF33 (cálculo da média) dependem da
// coleção completa e por isso ficam no AvaliacaoRepository.

export interface AvaliacaoJSON {
    id: string;
    filmeId: string;
    usuarioId: string;
    nota: number;
    comentario: string;
    dataCriacao: string;
}

export class Avaliacao {
    private readonly _id: string;
    private readonly _filmeId: string;
    private readonly _usuarioId: string;
    private _nota: number;
    private _comentario: string;
    private readonly _dataCriacao: string;

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

    get id() { return this._id; }
    get filmeId() { return this._filmeId; }
    get usuarioId() { return this._usuarioId; }
    get nota() { return this._nota; }
    get comentario() { return this._comentario; }
    get dataCriacao() { return this._dataCriacao; }

    set nota(nota: number) {
        Avaliacao.validarNota(nota);
        this._nota = nota;
    }

    set comentario(comentario: string) {
        this._comentario = comentario?.trim() ?? '';
    }

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

    private static validarFilmeId(filmeId: string): void {
        if (!filmeId || String(filmeId).trim().length === 0) {
            throw new Error('O filme avaliado é obrigatório.');
        }
    }

    private static validarUsuarioId(usuarioId: string): void {
        if (!usuarioId || String(usuarioId).trim().length === 0) {
            throw new Error('O usuário avaliador é obrigatório.'); // RNLF32
        }
    }

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
