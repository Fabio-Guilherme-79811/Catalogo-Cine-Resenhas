// Entidade Genero: categorias usadas pelos filmes (gênero principal e sub-gêneros).
// RNLF20 (unicidade de nome) e RNLF21 (não pode ser removido se estiver em uso)
// dependem da coleção completa e por isso são aplicadas no GeneroRepository.

export interface GeneroJSON {
    id: string;
    nome: string;
    descricao: string;
    ativo: boolean;
}

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

    get id() { return this._id; }
    get nome() { return this._nome; }
    get descricao() { return this._descricao; }
    get ativo() { return this._ativo; }

    // Usado pelo repositório para comparar nomes ignorando maiúsculas/minúsculas (RNLF20)
    get nomeNormalizado(): string {
        return this._nome.trim().toLowerCase();
    }

    set nome(nome: string) {
        Genero.validarNome(nome);
        this._nome = nome.trim();
    }

    set descricao(descricao: string) {
        this._descricao = descricao?.trim() ?? '';
    }

    set ativo(ativo: boolean) {
        this._ativo = ativo;
    }

    private static validarNome(nome: string): void {
        if (!nome || nome.trim().length < 2) {
            throw new Error('O nome do gênero deve ter no mínimo 2 caracteres.');
        }
    }

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

    toJSON(): GeneroJSON {
        return {
            id: this._id,
            nome: this._nome,
            descricao: this._descricao,
            ativo: this._ativo,
        };
    }
}
