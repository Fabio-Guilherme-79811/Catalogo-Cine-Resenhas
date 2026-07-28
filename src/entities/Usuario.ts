// Entidade Usuario: representa uma conta do sistema (comum ou admin).
// Regras de negócio aplicadas aqui: RNLF01 (unicidade de e-mail é validada
// no repositório, pois depende da coleção completa), RNLF02 (senha), RNLF03
// (ocultação do hash) e RNLF04 (papel padrão "comum").

export interface UsuarioJSON {
    id: string;
    nome: string;
    email: string;
    senhaHash: string;
    role: 'admin' | 'comum';
    criadoEm: string;
}

// Formato seguro para respostas de API/views: nunca inclui o hash da senha (RNLF03)
export type UsuarioPublico = Omit<UsuarioJSON, 'senhaHash'>;

export class Usuario {
    private readonly _id: string;
    private _nome: string;
    private _email: string;
    private _senhaHash: string;
    private _role: 'admin' | 'comum';
    private readonly _criadoEm: string;

    constructor(params: {
        id: string;
        nome: string;
        email: string;
        senhaHash: string;
        role?: 'admin' | 'comum';
        criadoEm?: string;
    }) {
        Usuario.validarNome(params.nome);
        Usuario.validarEmail(params.email);
        Usuario.validarSenhaHash(params.senhaHash);

        this._id = params.id;
        this._nome = params.nome.trim();
        this._email = params.email.trim().toLowerCase();
        this._senhaHash = params.senhaHash;
        this._role = params.role ?? 'comum'; // RNLF04 - padrão de novos cadastros é "comum"
        this._criadoEm = params.criadoEm ?? new Date().toISOString();
    }

    get id() { return this._id; }
    get nome() { return this._nome; }
    get email() { return this._email; }
    get senhaHash() { return this._senhaHash; }
    get role() { return this._role; }
    get criadoEm() { return this._criadoEm; }
    get ehAdmin(): boolean { return this._role === 'admin'; }

    set nome(nome: string) {
        Usuario.validarNome(nome);
        this._nome = nome.trim();
    }

    set email(email: string) {
        Usuario.validarEmail(email);
        this._email = email.trim().toLowerCase();
    }

    set senhaHash(hash: string) {
        Usuario.validarSenhaHash(hash);
        this._senhaHash = hash;
    }

    // Alterar o papel deve ser restrito a rotas administrativas (RNLF04)
    set role(role: 'admin' | 'comum') {
        Usuario.validarRole(role);
        this._role = role;
    }

    private static validarNome(nome: string): void {
        if (!nome || nome.trim().length < 2) {
            throw new Error('O nome do usuário deve ter no mínimo 2 caracteres.');
        }
    }

    private static validarEmail(email: string): void {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !regexEmail.test(email.trim())) {
            throw new Error('Informe um e-mail válido.');
        }
    }

    private static validarSenhaHash(hash: string): void {
        if (!hash || hash.trim().length === 0) {
            throw new Error('O hash de senha é obrigatório.');
        }
    }

    private static validarRole(role: string): asserts role is 'admin' | 'comum' {
        if (role !== 'admin' && role !== 'comum') {
            throw new Error('Papel de usuário inválido. Use "admin" ou "comum".');
        }
    }

    // RNLF02 - valida a senha em texto puro ANTES de gerar o hash com bcrypt.
    // Deve ser chamado pela rota/serviço de registro, nunca guardamos a senha em texto puro.
    static validarSenhaPlana(senha: string): void {
        if (!senha || senha.length < 6) {
            throw new Error('A senha deve ter no mínimo 6 caracteres.');
        }
    }

    private static validarJSON(data: unknown): asserts data is UsuarioJSON {
        if (typeof data !== 'object' || data === null) {
            throw new Error('JSON inválido: esperado um objeto.');
        }

        const obj = data as Record<string, unknown>;

        const camposString: (keyof UsuarioJSON)[] = ['id', 'nome', 'email', 'senhaHash', 'criadoEm'];
        for (const campo of camposString) {
            if (typeof obj[campo] !== 'string') {
                throw new Error(`Campo "${campo}" é obrigatório e deve ser uma string.`);
            }
        }

        if (obj.role !== 'admin' && obj.role !== 'comum') {
            throw new Error('Campo "role" é obrigatório e deve ser "admin" ou "comum".');
        }

        Usuario.validarNome(obj.nome as string);
        Usuario.validarEmail(obj.email as string);
    }

    static fromJSON(data: unknown): Usuario {
        const parsed: unknown = typeof data === 'string' ? JSON.parse(data) : data;

        Usuario.validarJSON(parsed);

        return new Usuario({
            id: parsed.id,
            nome: parsed.nome,
            email: parsed.email,
            senhaHash: parsed.senhaHash,
            role: parsed.role,
            criadoEm: parsed.criadoEm,
        });
    }

    // Serialização completa: usada apenas para persistência em dados/usuarios.json.
    // NÃO usar em respostas de API/views — usar toPublicJSON() (RNLF03).
    toJSON(): UsuarioJSON {
        return {
            id: this._id,
            nome: this._nome,
            email: this._email,
            senhaHash: this._senhaHash,
            role: this._role,
            criadoEm: this._criadoEm,
        };
    }

    // RNLF03 - remove o hash da senha antes de enviar o usuário para o cliente.
    toPublicJSON(): UsuarioPublico {
        const { senhaHash, ...dadosPublicos } = this.toJSON();
        return dadosPublicos;
    }
}
