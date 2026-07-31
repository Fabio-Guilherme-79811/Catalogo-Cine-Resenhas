import { Usuario } from '../Usuario';

describe('Entidade Usuario', () => {

    // Usuário usado como base na maioria dos testes
    const usuarioValido = {
        id: '1',
        nome: 'João',
        email: 'joao@email.com',
        senhaHash: 'hash123',
        role: 'comum' as const,
        criadoEm: '2026-01-01T00:00:00.000Z'
    };

    // Verifica se o construtor cria o usuário corretamente
    it('deve criar um usuário válido', () => {
        const usuario = new Usuario(usuarioValido);

        expect(usuario.id).toBe('1');
        expect(usuario.nome).toBe('João');
        expect(usuario.email).toBe('joao@email.com');
        expect(usuario.senhaHash).toBe('hash123');
        expect(usuario.role).toBe('comum');
        expect(usuario.criadoEm).toBe('2026-01-01T00:00:00.000Z');
    });

    // Se a role não for informada, o padrão deve ser "comum"
    it('deve definir role comum por padrão', () => {
        const usuario = new Usuario({
            id: '1',
            nome: 'Maria',
            email: 'maria@email.com',
            senhaHash: 'hash123'
        });

        expect(usuario.role).toBe('comum');
    });

    // Confere se um usuário comum não é admin
    it('ehAdmin deve retornar false para usuário comum', () => {
        const usuario = new Usuario(usuarioValido);

        expect(usuario.ehAdmin).toBe(false);
    });

    // Confere se um administrador é reconhecido corretamente
    it('ehAdmin deve retornar true para admin', () => {
        const usuario = new Usuario({
            ...usuarioValido,
            role: 'admin'
        });

        expect(usuario.ehAdmin).toBe(true);
    });

    // Não deve aceitar nome muito curto
    it('deve lançar erro para nome inválido', () => {
        expect(() =>
            new Usuario({
                ...usuarioValido,
                nome: 'A'
            })
        ).toThrow('O nome do usuário deve ter no mínimo 2 caracteres.');
    });

    // Não deve aceitar e-mail inválido
    it('deve lançar erro para email inválido', () => {
        expect(() =>
            new Usuario({
                ...usuarioValido,
                email: 'email'
            })
        ).toThrow('Informe um e-mail válido.');
    });

    // O hash da senha é obrigatório
    it('deve lançar erro para senhaHash vazia', () => {
        expect(() =>
            new Usuario({
                ...usuarioValido,
                senhaHash: ''
            })
        ).toThrow('O hash de senha é obrigatório.');
    });

    // Testa alteração do nome
    it('setter nome deve funcionar', () => {
        const usuario = new Usuario(usuarioValido);

        usuario.nome = 'Carlos';

        expect(usuario.nome).toBe('Carlos');
    });

    // O e-mail deve ser salvo em letras minúsculas
    it('setter email deve converter para minúsculo', () => {
        const usuario = new Usuario(usuarioValido);

        usuario.email = 'TESTE@EMAIL.COM';

        expect(usuario.email).toBe('teste@email.com');
    });

    // Testa alteração do hash da senha
    it('setter senhaHash deve alterar o hash', () => {
        const usuario = new Usuario(usuarioValido);

        usuario.senhaHash = 'novoHash';

        expect(usuario.senhaHash).toBe('novoHash');
    });

    // Deve permitir trocar a role para admin
    it('setter role deve alterar para admin', () => {
        const usuario = new Usuario(usuarioValido);

        usuario.role = 'admin';

        expect(usuario.role).toBe('admin');
    });

    // Não pode aceitar uma role inexistente
    it('setter role inválido deve lançar erro', () => {
        const usuario = new Usuario(usuarioValido);

        expect(() => {
            (usuario as any).role = 'gerente';
        }).toThrow('Papel de usuário inválido. Use "admin" ou "comum".');
    });

    // Senha com tamanho suficiente não deve gerar erro
    it('validarSenhaPlana deve aceitar senha válida', () => {
        expect(() =>
            Usuario.validarSenhaPlana('123456')
        ).not.toThrow();
    });

    // Senha muito curta deve gerar erro
    it('validarSenhaPlana deve rejeitar senha curta', () => {
        expect(() =>
            Usuario.validarSenhaPlana('123')
        ).toThrow('A senha deve ter no mínimo 6 caracteres.');
    });

    // Verifica se todos os dados são retornados
    it('toJSON deve retornar todos os campos', () => {
        const usuario = new Usuario(usuarioValido);

        expect(usuario.toJSON()).toEqual(usuarioValido);
    });

    // O hash da senha não deve aparecer no retorno público
    it('toPublicJSON não deve retornar senhaHash', () => {
        const usuario = new Usuario(usuarioValido);

        expect(usuario.toPublicJSON()).toEqual({
            id: '1',
            nome: 'João',
            email: 'joao@email.com',
            role: 'comum',
            criadoEm: '2026-01-01T00:00:00.000Z'
        });
    });

    // Cria um usuário usando um objeto
    it('fromJSON deve criar um usuário a partir de objeto', () => {
        const usuario = Usuario.fromJSON(usuarioValido);

        expect(usuario.nome).toBe('João');
        expect(usuario.email).toBe('joao@email.com');
    });

    // Cria um usuário usando uma string JSON
    it('fromJSON deve criar um usuário a partir de string JSON', () => {
        const json = JSON.stringify(usuarioValido);

        const usuario = Usuario.fromJSON(json);

        expect(usuario.nome).toBe('João');
    });

    // Deve dar erro quando os dados estiverem incompletos
    it('fromJSON deve lançar erro para JSON inválido', () => {
        expect(() =>
            Usuario.fromJSON({
                nome: 'João'
            })
        ).toThrow();
    });

});