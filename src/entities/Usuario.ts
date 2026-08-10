// Entidade Usuario: representa uma conta do sistema (comum ou admin).
// Regras de negócio aplicadas aqui: RNLF01 (unicidade de e-mail é validada
// no repositório, pois depende da coleção completa), RNLF02 (senha), RNLF03
// (ocultação do hash) e RNLF04 (papel padrão "comum").

/**
 * Formato bruto de {@link Usuario} utilizado para persistência em JSON.
 */
export interface UsuarioJSON {
    id: string;
    nome: string;
    email: string;
    senhaHash: string;
    role: 'admin' | 'comum';
    criadoEm: string;
}

// Formato seguro para respostas de API/views: nunca inclui o hash da senha (RNLF03)
/**
 * Formato seguro de usuário para respostas de API/views.
 *
 * RNLF03 - nunca inclui o campo `senhaHash`, evitando o vazamento do hash
 * de senha para o cliente.
 */
// Formato seguro para respostas de API/views: nunca inclui o hash da senha (RNLF03)
export type UsuarioPublico = Omit<UsuarioJSON, 'senhaHash'>;

/**
 * Entidade que representa uma conta de usuário do sistema (papel `comum` ou `admin`).
 *
 * Encapsula as validações de nome, e-mail, hash de senha e papel, garantindo
 * que nenhuma instância exista em estado inválido.
 */
export class Usuario {
    private readonly _id: string;
    private _nome: string;
    private _email: string;
    private _senhaHash: string;
    private _role: 'admin' | 'comum';
    private readonly _criadoEm: string;

     /**
     * Cria uma nova instância de {@link Usuario}, validando nome, e-mail e hash de senha.
     *
     * @param params - Dados do usuário.
     * @param params.id - Identificador único do usuário.
     * @param params.nome - Nome do usuário (mínimo 2 caracteres, é normalizado com `trim`).
     * @param params.email - E-mail do usuário (validado e normalizado para minúsculas).
     * @param params.senhaHash - Hash da senha já processado (nunca a senha em texto puro).
     * @param params.role - Papel do usuário. Padrão: `'comum'` (RNLF04).
     * @param params.criadoEm - Data de criação em formato ISO. Padrão: data/hora atual.
     * @throws {Error} Caso nome, e-mail ou hash de senha sejam inválidos.
     */
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

     /** Identificador único do usuário. */
    get id() { return this._id; }
     /** Nome do usuário. */
    get nome() { return this._nome; }
     /** E-mail normalizado (minúsculas, sem espaços) do usuário. */
    get email() { return this._email; }
     /** Hash da senha do usuário. */
    get senhaHash() { return this._senhaHash; }
     /** Papel do usuário (`'admin'` ou `'comum'`). */
    get role() { return this._role; }
     /** Data de criação da conta, em formato ISO. */
    get criadoEm() { return this._criadoEm; }
     /** Indica se o usuário possui papel de administrador. */
    get ehAdmin(): boolean { return this._role === 'admin'; }

    /**
     * Atualiza o nome do usuário, validando o novo valor.
     * @throws {Error} Caso o nome seja inválido (menor que 2 caracteres).
     */
    set nome(nome: string) {
        Usuario.validarNome(nome);
        this._nome = nome.trim();
    }

     /**
     * Atualiza o e-mail do usuário, validando e normalizando o novo valor.
     * @throws {Error} Caso o e-mail seja inválido.
     */
    set email(email: string) {
        Usuario.validarEmail(email);
        this._email = email.trim().toLowerCase();
    }

     /**
     * Atualiza o hash de senha do usuário.
     * @throws {Error} Caso o hash seja vazio ou inválido.
     */
    set senhaHash(hash: string) {
        Usuario.validarSenhaHash(hash);
        this._senhaHash = hash;
    }

       /**
     * Atualiza o papel do usuário.
     *
     * RNLF04 - alterar o papel deve ser restrito a rotas administrativas.
     *
     * @throws {Error} Caso o papel informado não seja `'admin'` nem `'comum'`.
     */
    // Alterar o papel deve ser restrito a rotas administrativas (RNLF04)
    set role(role: 'admin' | 'comum') {
        Usuario.validarRole(role);
        this._role = role;
    }

      /**
     * Valida se o nome atende ao tamanho mínimo exigido.
     * @throws {Error} Caso o nome seja vazio ou tenha menos de 2 caracteres.
     */
    private static validarNome(nome: string): void {
        if (!nome || nome.trim().length < 2) {
            throw new Error('O nome do usuário deve ter no mínimo 2 caracteres.');
        }
    }

     /**
     * Valida se o e-mail possui um formato válido.
     * @throws {Error} Caso o e-mail seja vazio ou não corresponda ao formato esperado.
     */
    private static validarEmail(email: string): void {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !regexEmail.test(email.trim())) {
            throw new Error('Informe um e-mail válido.');
        }
    }

     /**
     * Valida se o hash de senha foi informado.
     * @throws {Error} Caso o hash seja vazio.
     */
    private static validarSenhaHash(hash: string): void {
        if (!hash || hash.trim().length === 0) {
            throw new Error('O hash de senha é obrigatório.');
        }
    }

    /**
     * Valida se o papel informado é um valor permitido (`'admin'` ou `'comum'`).
     * @throws {Error} Caso o papel seja diferente de `'admin'` ou `'comum'`.
     */
    private static validarRole(role: string): asserts role is 'admin' | 'comum' {
        if (role !== 'admin' && role !== 'comum') {
            throw new Error('Papel de usuário inválido. Use "admin" ou "comum".');
        }
    }

     /**
     * Valida a senha em texto puro antes de ser transformada em hash.
     *
     * RNLF02 - deve ser chamado pela rota/serviço de registro antes de gerar
     * o hash com bcrypt; a senha em texto puro nunca deve ser persistida.
     *
     * @param senha - Senha em texto puro informada pelo usuário.
     * @throws {Error} Caso a senha tenha menos de 6 caracteres.
     */
    // RNLF02 - valida a senha em texto puro ANTES de gerar o hash com bcrypt.
    // Deve ser chamado pela rota/serviço de registro, nunca guardamos a senha em texto puro.
    static validarSenhaPlana(senha: string): void {
        if (!senha || senha.length < 6) {
            throw new Error('A senha deve ter no mínimo 6 caracteres.');
        }
    }


    /**
     * Valida se um valor desconhecido possui o formato de {@link UsuarioJSON}.
     * @throws {Error} Caso algum campo obrigatório esteja ausente ou em formato inválido.
     */
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

      /**
     * Cria uma instância de {@link Usuario} a partir de dados brutos (objeto ou string JSON).
     *
     * @param data - Dados no formato {@link UsuarioJSON}, como objeto ou string JSON.
     * @returns Uma nova instância de {@link Usuario}.
     * @throws {Error} Caso os dados não correspondam ao formato esperado de {@link UsuarioJSON}.
     */
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

    /**
     * Serializa a instância para o formato {@link UsuarioJSON}, incluindo o hash de senha.
     *
     * Usado apenas para persistência em `dados/usuarios.json`. NÃO deve ser usado
     * em respostas de API/views — usar {@link toPublicJSON} (RNLF03).
     *
     * @returns Os dados do usuário no formato {@link UsuarioJSON}.
     */
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

     /**
     * Serializa a instância para um formato seguro, sem o hash de senha.
     *
     * RNLF03 - remove o hash da senha antes de enviar o usuário para o cliente.
     *
     * @returns Os dados públicos do usuário, no formato {@link UsuarioPublico}.
     */
    // RNLF03 - remove o hash da senha antes de enviar o usuário para o cliente.
    toPublicJSON(): UsuarioPublico {
        const { senhaHash, ...dadosPublicos } = this.toJSON();
        return dadosPublicos;
    }
}
