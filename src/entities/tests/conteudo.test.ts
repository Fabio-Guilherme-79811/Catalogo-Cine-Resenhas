import { Conteudo, ConteudoJSON } from '../conteudo.js';

const anoAtual = new Date().getFullYear();

function paramsValidos(overrides: Partial<{
    id: string;
    titulo: string;
    sinopse: string;
    capaUrl: string;
    genero: string | number;
    tipo: string;
    direcao: string;
    anoLancamento: number;
    diretor: string;
    duracao: number;
    avaliacao: number;
}> = {}) {
    return {
        id: '1',
        titulo: 'Matrix',
        sinopse: 'Um hacker descobre a verdade sobre a realidade.',
        capaUrl: 'https://exemplo.com/matrix.jpg',
        genero: 'Ficção Científica',
        tipo: 'Filme',
        direcao: 'Lana Wachowski',
        anoLancamento: 1999,
        diretor: 'Lana e Lilly Wachowski',
        duracao: 136,
        avaliacao: 9,
        ...overrides,
    };
}

describe('Conteudo - construtor', () => {
    it('deve criar uma instância com dados válidos', () => {
        const conteudo = new Conteudo(paramsValidos());

        expect(conteudo.id).toBe('1');
        expect(conteudo.titulo).toBe('Matrix');
        expect(conteudo.sinopse).toBe('Um hacker descobre a verdade sobre a realidade.');
        expect(conteudo.capaUrl).toBe('https://exemplo.com/matrix.jpg');
        expect(conteudo.genero).toBe('Ficção Científica');
        expect(conteudo.tipo).toBe('Filme');
        expect(conteudo.direcao).toBe('Lana Wachowski');
        expect(conteudo.anoLancamento).toBe(1999);
        expect(conteudo.diretor).toBe('Lana e Lilly Wachowski');
        expect(conteudo.duracao).toBe(136);
        expect(conteudo.avaliacao).toBe(9);
    });

    it('deve aceitar genero numérico', () => {
        const conteudo = new Conteudo(paramsValidos({ genero: 3 }));
        expect(conteudo.genero).toBe(3);
    });

    it('deve usar 0 como avaliação padrão quando não informada (undefined)', () => {
        const params = paramsValidos();
        // @ts-expect-error simula avaliação ausente, já que o tipo do construtor exige o campo
        delete params.avaliacao;
        const conteudo = new Conteudo(params);
        expect(conteudo.avaliacao).toBe(0);
    });

    it('deve lançar erro se o título for vazio', () => {
        expect(() => new Conteudo(paramsValidos({ titulo: '' })))
            .toThrow('O titulo do filme é obrigatório.');
    });

    it('deve lançar erro se o título contiver apenas espaços', () => {
        expect(() => new Conteudo(paramsValidos({ titulo: '   ' })))
            .toThrow('O titulo do filme é obrigatório.');
    });

    it('deve lançar erro se o ano de lançamento for menor que 1888', () => {
        expect(() => new Conteudo(paramsValidos({ anoLancamento: 1887 })))
            .toThrow('Ano de lançamento inválido.');
    });

    it('deve lançar erro se o ano de lançamento for maior que anoAtual + 5', () => {
        expect(() => new Conteudo(paramsValidos({ anoLancamento: anoAtual + 6 })))
            .toThrow('Ano de lançamento inválido.');
    });

    it('deve lançar erro se o ano de lançamento for 0', () => {
        expect(() => new Conteudo(paramsValidos({ anoLancamento: 0 })))
            .toThrow('Ano de lançamento inválido.');
    });

    it('deve aceitar o ano limite inferior (1888)', () => {
        const conteudo = new Conteudo(paramsValidos({ anoLancamento: 1888 }));
        expect(conteudo.anoLancamento).toBe(1888);
    });

    it('deve aceitar o ano limite superior (anoAtual + 5)', () => {
        const conteudo = new Conteudo(paramsValidos({ anoLancamento: anoAtual + 5 }));
        expect(conteudo.anoLancamento).toBe(anoAtual + 5);
    });
});

describe('Conteudo - setters', () => {
    it('deve atualizar o título com um valor válido', () => {
        const conteudo = new Conteudo(paramsValidos());
        conteudo.titulo = 'Novo Título';
        expect(conteudo.titulo).toBe('Novo Título');
    });

    it('deve lançar erro ao tentar definir título vazio', () => {
        const conteudo = new Conteudo(paramsValidos());
        expect(() => { conteudo.titulo = ''; })
            .toThrow('O titulo do filme é obrigatório.');
    });

    it('deve manter o título anterior se a atualização falhar', () => {
        const conteudo = new Conteudo(paramsValidos());
        try {
            conteudo.titulo = '';
        } catch {
            // esperado
        }
        expect(conteudo.titulo).toBe('Matrix');
    });

    it('deve atualizar o ano de lançamento com um valor válido', () => {
        const conteudo = new Conteudo(paramsValidos());
        conteudo.anoLancamento = 2020;
        expect(conteudo.anoLancamento).toBe(2020);
    });

    it('deve lançar erro ao tentar definir ano de lançamento inválido', () => {
        const conteudo = new Conteudo(paramsValidos());
        expect(() => { conteudo.anoLancamento = 1800; })
            .toThrow('Ano de lançamento inválido.');
    });
});

describe('Conteudo.fromJSON', () => {
    const jsonValido: ConteudoJSON = {
        id: '10',
        titulo: 'Interestelar',
        sinopse: 'Uma jornada através de um buraco de minhoca.',
        capaUrl: 'https://exemplo.com/interestelar.jpg',
        genero: 'Ficção Científica',
        anoLancamento: 2014,
        diretor: 'Christopher Nolan',
        tipo: 'Filme',
        duracao: 169,
        direcao: 'Christopher Nolan',
        avaliacao: 10,
    };

    it('deve criar uma instância a partir de um objeto válido', () => {
        const conteudo = Conteudo.fromJSON(jsonValido);
        expect(conteudo.titulo).toBe('Interestelar');
        expect(conteudo.anoLancamento).toBe(2014);
        expect(conteudo.avaliacao).toBe(10);
    });

    it('deve criar uma instância a partir de uma string JSON válida', () => {
        const conteudo = Conteudo.fromJSON(JSON.stringify(jsonValido));
        expect(conteudo.titulo).toBe('Interestelar');
    });

    it('deve aceitar genero numérico', () => {
        const conteudo = Conteudo.fromJSON({ ...jsonValido, genero: 5 });
        expect(conteudo.genero).toBe(5);
    });

    it('deve usar 0 como avaliação padrão quando o campo não é informado', () => {
        const { avaliacao, ...semAvaliacao } = jsonValido;
        const conteudo = Conteudo.fromJSON(semAvaliacao);
        expect(conteudo.avaliacao).toBe(0);
    });

    it('deve lançar erro se os dados não forem um objeto', () => {
        expect(() => Conteudo.fromJSON('42')).toThrow('JSON inválido: esperado um objeto.');
    });

    it('deve lançar erro se os dados forem null', () => {
        expect(() => Conteudo.fromJSON(null)).toThrow('JSON inválido: esperado um objeto.');
    });

    it.each([
        'id', 'titulo', 'sinopse', 'capaUrl', 'diretor', 'tipo', 'direcao',
    ] as (keyof ConteudoJSON)[])('deve lançar erro se o campo "%s" não for string', (campo) => {
        const invalido = { ...jsonValido, [campo]: 123 };
        expect(() => Conteudo.fromJSON(invalido))
            .toThrow(`Campo "${String(campo)}" é obrigatório e deve ser uma string.`);
    });
    
    it('deve lançar erro se "genero" não for string nem número', () => {
        const invalido = { ...jsonValido, genero: true };
        expect(() => Conteudo.fromJSON(invalido))
            .toThrow('Campo "genero" é obrigatório e deve ser string ou número.');
    });

    it('deve lançar erro se "anoLancamento" não for número', () => {
        const invalido = { ...jsonValido, anoLancamento: '2014' };
        expect(() => Conteudo.fromJSON(invalido))
            .toThrow('Campo "anoLancamento" é obrigatório e deve ser numérico.');
    });

    it('deve lançar erro se "duracao" não for número', () => {
        const invalido = { ...jsonValido, duracao: '169' };
        expect(() => Conteudo.fromJSON(invalido))
            .toThrow('Campo "duracao" é obrigatório e deve ser numérico.');
    });

    it('deve lançar erro se "avaliacao" for informado mas não for número', () => {
        const invalido = { ...jsonValido, avaliacao: 'dez' };
        expect(() => Conteudo.fromJSON(invalido))
            .toThrow('Campo "avaliacao", quando informado, deve ser numérico.');
    });

    it('deve reaproveitar a validação de título do construtor', () => {
        const invalido = { ...jsonValido, titulo: '   ' };
        expect(() => Conteudo.fromJSON(invalido))
            .toThrow('O titulo do filme é obrigatório.');
    });

    it('deve reaproveitar a validação de ano de lançamento do construtor', () => {
        const invalido = { ...jsonValido, anoLancamento: 1800 };
        expect(() => Conteudo.fromJSON(invalido))
            .toThrow('Ano de lançamento inválido.');
    });
});

describe('Conteudo - toJSON', () => {
    it('deve serializar a instância corretamente, convertendo id para string', () => {
        const conteudo = new Conteudo(paramsValidos({ id: '7' }));
        const json = conteudo.toJSON();

        expect(json).toEqual({
            id: '7',
            titulo: 'Matrix',
            sinopse: 'Um hacker descobre a verdade sobre a realidade.',
            capaUrl: 'https://exemplo.com/matrix.jpg',
            genero: 'Ficção Científica',
            anoLancamento: 1999,
            diretor: 'Lana e Lilly Wachowski',
            tipo: 'Filme',
            duracao: 136,
            direcao: 'Lana Wachowski',
            avaliacao: 9,
        });
    });

    it('deve permitir reconstruir a instância a partir do toJSON (round-trip)', () => {
        const original = new Conteudo(paramsValidos());
        const clone = Conteudo.fromJSON(original.toJSON());

        expect(clone.toJSON()).toEqual(original.toJSON());
    });
});
