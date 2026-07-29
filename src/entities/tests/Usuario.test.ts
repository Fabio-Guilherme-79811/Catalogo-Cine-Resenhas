import { Usuario } from '../Usuario';

describe('Entidade Usuario', () => {

    const usuarioValido = {
        id: '1',
        nome: 'João',
        email: 'joao@email.com',
        senhaHash: 'hash123',
        role: 'comum' as const,
        criadoEm: '2026-01-01T00:00:00.000Z'
    };

    test('deve criar um usuário válido', () => {
        const usuario = new Usuario(usuarioValido);

        expect(usuario.id).toBe('1');
        expect(usuario.nome).toBe('João');
        expect(usuario.email).toBe('joao@email.com');
        expect(usuario.senhaHash).toBe('hash123');
        expect(usuario.role).toBe('comum');
        expect(usuario.criadoEm).toBe('2026-01-01T00:00:00.000Z');
    });

    test('deve definir role comum por padrão', () => {
        const usuario = new Usuario({
            id: '1',
            nome: 'Maria',
            email: 'maria@email.com',
            senhaHash: 'hash123'
        });

        expect(usuario.role).toBe('comum');
    });

    test('ehAdmin deve retornar false para usuário comum', () => {
        const usuario = new Usuario(usuarioValido);

        expect(usuario.ehAdmin).toBe(false);
    });

    test('ehAdmin deve retornar true para admin', () => {
        const usuario = new Usuario({
            ...usuarioValido,
            role: 'admin'
        });

        expect(usuario.ehAdmin).toBe(true);
    });

    test('deve lançar erro para nome inválido', () => {
        expect(() =>
            new Usuario({
                ...usuarioValido,
                nome: 'A'
            })
        ).toThrow('O nome do usuário deve ter no mínimo 2 caracteres.');
    });

    test('deve lançar erro para email inválido', () => {
        expect(() =>
            new Usuario({
                ...usuarioValido,
                email: 'email'
            })
        ).toThrow('Informe um e-mail válido.');
    });

    test('deve lançar erro para senhaHash vazio', () => {
        expect(() =>
            new Usuario({
                ...usuarioValido,
                senhaHash: ''
            })
        ).toThrow('O hash de senha é obrigatório.');
    });

    test('setter nome deve funcionar', () => {
        const usuario = new Usuario(usuarioValido);

        usuario.nome = 'Carlos';

        expect(usuario.nome).toBe('Carlos');
    });

    test('setter email deve converter para minúsculo', () => {
        const usuario = new Usuario(usuarioValido);

        usuario.email = 'TESTE@EMAIL.COM';

        expect(usuario.email).toBe('teste@email.com');
    });

    test('setter senhaHash deve alterar o hash', () => {
        const usuario = new Usuario(usuarioValido);

        usuario.senhaHash = 'novoHash';

        expect(usuario.senhaHash).toBe('novoHash');
    });

    test('setter role deve alterar para admin', () => {
        const usuario = new Usuario(usuarioValido);

        usuario.role = 'admin';

        expect(usuario.role).toBe('admin');
    });

    test('setter role inválido deve lançar erro', () => {
        const usuario = new Usuario(usuarioValido);

        expect(() => {
            (usuario as any).role = 'gerente';
        }).toThrow('Papel de usuário inválido. Use "admin" ou "comum".');
    });

    test('validarSenhaPlana deve aceitar senha válida', () => {
        expect(() =>
            Usuario.validarSenhaPlana('123456')
        ).not.toThrow();
    });

    test('validarSenhaPlana deve rejeitar senha curta', () => {
        expect(() =>
            Usuario.validarSenhaPlana('123')
        ).toThrow('A senha deve ter no mínimo 6 caracteres.');
    });

    test('toJSON deve retornar todos os campos', () => {
        const usuario = new Usuario(usuarioValido);

        expect(usuario.toJSON()).toEqual(usuarioValido);
    });

    test('toPublicJSON não deve retornar senhaHash', () => {
        const usuario = new Usuario(usuarioValido);

        expect(usuario.toPublicJSON()).toEqual({
            id: '1',
            nome: 'João',
            email: 'joao@email.com',
            role: 'comum',
            criadoEm: '2026-01-01T00:00:00.000Z'
        });
    });

    test('fromJSON deve criar um usuário a partir de objeto', () => {
        const usuario = Usuario.fromJSON(usuarioValido);

        expect(usuario.nome).toBe('João');
        expect(usuario.email).toBe('joao@email.com');
    });

    test('fromJSON deve criar um usuário a partir de string JSON', () => {
        const json = JSON.stringify(usuarioValido);

        const usuario = Usuario.fromJSON(json);

        expect(usuario.nome).toBe('João');
    });

    test('fromJSON deve lançar erro para JSON inválido', () => {
        expect(() =>
            Usuario.fromJSON({
                nome: 'João'
            })
        ).toThrow();
    });

});