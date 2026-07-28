// Entidade Favorito: relação entre um usuário e um filme salvo por ele.
// A regra de não duplicar o mesmo favorito para o mesmo usuário/filme
// é aplicada no FavoritoRepository, pois depende da coleção completa.

export interface FavoritoJSON {
    id: string;
    usuarioId: string;
    filmeId: string;
    adicionadoEm: string;
}

export class Favorito {
    private readonly _id: string;
    private readonly _usuarioId: string;
    private readonly _filmeId: string;
    private readonly _adicionadoEm: string;

    constructor(params: { id: string; usuarioId: string; filmeId: string; adicionadoEm?: string }) {
        Favorito.validarUsuarioId(params.usuarioId);
        Favorito.validarFilmeId(params.filmeId);

        this._id = params.id;
        this._usuarioId = params.usuarioId;
        this._filmeId = params.filmeId;
        this._adicionadoEm = params.adicionadoEm ?? new Date().toISOString();
    }

    get id() { return this._id; }
    get usuarioId() { return this._usuarioId; }
    get filmeId() { return this._filmeId; }
    get adicionadoEm() { return this._adicionadoEm; }

    private static validarUsuarioId(usuarioId: string): void {
        if (!usuarioId || String(usuarioId).trim().length === 0) {
            throw new Error('O usuário é obrigatório para favoritar um filme.');
        }
    }

    private static validarFilmeId(filmeId: string): void {
        if (!filmeId || String(filmeId).trim().length === 0) {
            throw new Error('O filme é obrigatório para ser favoritado.');
        }
    }

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

    toJSON(): FavoritoJSON {
        return {
            id: this._id,
            usuarioId: this._usuarioId,
            filmeId: this._filmeId,
            adicionadoEm: this._adicionadoEm,
        };
    }
}
