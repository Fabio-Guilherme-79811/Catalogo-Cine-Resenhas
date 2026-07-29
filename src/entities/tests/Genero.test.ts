import { Genero, GeneroJSON } from '../Genero';

// Testes unitários da entidade Genero.
// Cobrem: construção/validação de nome, getters/setters, nomeNormalizado,
// fromJSON (incluindo entrada em string e objeto) e toJSON.
// As regras RNLF20 (unicidade) e RNLF21 (não remover se em uso) NÃO são
// testadas aqui, pois dependem da coleção completa e pertencem ao
// GeneroRepository (fora do escopo desta entidade).

describe('Genero', () => {
    // ---------------------------------------------------------------------
    // Construtor / validação de nome
    // ---------------------------------------------------------------------
    describe('constructor', () => {
        it('deve criar um Genero com os valores informados', () => {
            const genero = new Genero({
                id: '1',
                nome: 'Ação',
                descricao: 'Filmes de ação',
                ativo: false,
            });

            expect(genero.id).toBe('1');
            expect(genero.nome).toBe('Ação');
            expect(genero.descricao).toBe('Filmes de ação');
            expect(genero.ativo).toBe(false);
        });

        it('deve aplicar trim no nome informado', () => {
            const genero = new Genero({ id: '1', nome: '  Terror  ' });
            expect(genero.nome).toBe('Terror');
        });

        it('deve aplicar trim na descrição informada', () => {
            const genero = new Genero({ id: '1', nome: 'Terror', descricao: '  assustador  ' });
            expect(genero.descricao).toBe('assustador');
        });

        it('deve usar descricao vazia como padrão quando não informada', () => {
            const genero = new Genero({ id: '1', nome: 'Comédia' });
            expect(genero.descricao).toBe('');
        });

        it('deve usar ativo = true como padrão quando não informado', () => {
            const genero = new Genero({ id: '1', nome: 'Comédia' });
            expect(genero.ativo).toBe(true);
        });

        it('deve lançar erro quando o nome não é informado', () => {
            expect(() => new Genero({ id: '1', nome: '' })).toThrow(
                'O nome do gênero deve ter no mínimo 2 caracteres.'
            );
        });

        it('deve lançar erro quando o nome tem menos de 2 caracteres (após trim)', () => {
            expect(() => new Genero({ id: '1', nome: ' a ' })).toThrow(
                'O nome do gênero deve ter no mínimo 2 caracteres.'
            );
        });

        it('deve aceitar nome com exatamente 2 caracteres', () => {
            const genero = new Genero({ id: '1', nome: 'Aa' });
            expect(genero.nome).toBe('Aa');
        });
    });

    // ---------------------------------------------------------------------
    // Getters / setters
    // ---------------------------------------------------------------------
    describe('setters', () => {
        it('deve atualizar o nome com trim e validação', () => {
            const genero = new Genero({ id: '1', nome: 'Drama' });
            genero.nome = '  Suspense  ';
            expect(genero.nome).toBe('Suspense');
        });

        it('deve lançar erro ao setar um nome inválido', () => {
            const genero = new Genero({ id: '1', nome: 'Drama' });
            expect(() => (genero.nome = 'a')).toThrow(
                'O nome do gênero deve ter no mínimo 2 caracteres.'
            );
        });

        it('não deve alterar o nome quando o novo valor é inválido', () => {
            const genero = new Genero({ id: '1', nome: 'Drama' });
            expect(() => (genero.nome = 'a')).toThrow();
            expect(genero.nome).toBe('Drama');
        });

        it('deve atualizar a descrição com trim', () => {
            const genero = new Genero({ id: '1', nome: 'Drama' });
            genero.descricao = '  nova descrição  ';
            expect(genero.descricao).toBe('nova descrição');
        });

        it('deve atualizar o status ativo', () => {
            const genero = new Genero({ id: '1', nome: 'Drama', ativo: true });
            genero.ativo = false;
            expect(genero.ativo).toBe(false);
        });

        it('id deve ser somente leitura (sem setter em tempo de compilação)', () => {
            const genero = new Genero({ id: '1', nome: 'Drama' });
            // @ts-expect-error - id não possui setter, garantindo imutabilidade
            genero.id = '2';
            expect(genero.id).toBe('1');
        });
    });

    // ---------------------------------------------------------------------
    // nomeNormalizado
    // ---------------------------------------------------------------------
    describe('nomeNormalizado', () => {
        it('deve retornar o nome em minúsculas e sem espaços extras', () => {
            const genero = new Genero({ id: '1', nome: 'AÇÃO' });
            expect(genero.nomeNormalizado).toBe('ação');
        });

        it('deve refletir alterações feitas via setter', () => {
            const genero = new Genero({ id: '1', nome: 'Drama' });
            genero.nome = '  COMÉDIA ROMÂNTICA  ';
            expect(genero.nomeNormalizado).toBe('comédia romântica');
        });
    });

    // ---------------------------------------------------------------------
    // fromJSON
    // ---------------------------------------------------------------------
    describe('fromJSON', () => {
        const jsonValido: GeneroJSON = {
            id: '10',
            nome: 'Ficção Científica',
            descricao: 'Filmes futuristas',
            ativo: true,
        };

        it('deve criar um Genero a partir de um objeto válido', () => {
            const genero = Genero.fromJSON(jsonValido);
            expect(genero.id).toBe('10');
            expect(genero.nome).toBe('Ficção Científica');
            expect(genero.descricao).toBe('Filmes futuristas');
            expect(genero.ativo).toBe(true);
        });

        it('deve criar um Genero a partir de uma string JSON válida', () => {
            const genero = Genero.fromJSON(JSON.stringify(jsonValido));
            expect(genero.id).toBe('10');
            expect(genero.nome).toBe('Ficção Científica');
        });

        it('deve aceitar objeto sem o campo "descricao"', () => {
            const { descricao, ...semDescricao } = jsonValido;
            const genero = Genero.fromJSON(semDescricao);
            expect(genero.descricao).toBe('');
        });

        it('deve lançar erro quando o dado não é um objeto', () => {
            expect(() => Genero.fromJSON('"apenas uma string"')).toThrow(
                'JSON inválido: esperado um objeto.'
            );
        });

        it('deve lançar erro quando o dado é null', () => {
            expect(() => Genero.fromJSON(null)).toThrow('JSON inválido: esperado um objeto.');
        });

        it('deve lançar erro quando "id" não é string', () => {
            expect(() => Genero.fromJSON({ ...jsonValido, id: 10 })).toThrow(
                'Campo "id" é obrigatório e deve ser uma string.'
            );
        });

        it('deve lançar erro quando "nome" não é string', () => {
            expect(() => Genero.fromJSON({ ...jsonValido, nome: 123 })).toThrow(
                'Campo "nome" é obrigatório e deve ser uma string.'
            );
        });

        it('deve lançar erro quando "descricao" é informada mas não é string', () => {
            expect(() => Genero.fromJSON({ ...jsonValido, descricao: 123 })).toThrow(
                'Campo "descricao", quando informado, deve ser uma string.'
            );
        });

        it('deve lançar erro quando "ativo" não é booleano', () => {
            expect(() => Genero.fromJSON({ ...jsonValido, ativo: 'sim' })).toThrow(
                'Campo "ativo" é obrigatório e deve ser booleano.'
            );
        });

        it('deve lançar erro quando "ativo" não é informado', () => {
            const { ativo, ...semAtivo } = jsonValido;
            expect(() => Genero.fromJSON(semAtivo)).toThrow(
                'Campo "ativo" é obrigatório e deve ser booleano.'
            );
        });

        it('deve lançar erro quando o nome do JSON é inválido (regra de negócio)', () => {
            expect(() => Genero.fromJSON({ ...jsonValido, nome: 'a' })).toThrow(
                'O nome do gênero deve ter no mínimo 2 caracteres.'
            );
        });

        it('deve lançar erro ao receber uma string JSON malformada', () => {
            expect(() => Genero.fromJSON('{invalido')).toThrow();
        });
    });

    // ---------------------------------------------------------------------
    // toJSON
    // ---------------------------------------------------------------------
    describe('toJSON', () => {
        it('deve serializar corretamente todos os campos', () => {
            const genero = new Genero({
                id: '5',
                nome: 'Aventura',
                descricao: 'Filmes de aventura',
                ativo: false,
            });

            expect(genero.toJSON()).toEqual({
                id: '5',
                nome: 'Aventura',
                descricao: 'Filmes de aventura',
                ativo: false,
            });
        });

        it('deve permitir round-trip (toJSON -> fromJSON) preservando os dados', () => {
            const original = new Genero({
                id: '7',
                nome: 'Documentário',
                descricao: 'Baseado em fatos reais',
                ativo: true,
            });

            const restaurado = Genero.fromJSON(original.toJSON());

            expect(restaurado.toJSON()).toEqual(original.toJSON());
        });
    });
});