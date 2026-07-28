// Import ajustado para NodeNext/Node16: precisa da extensão .js mesmo
// importando de um arquivo .ts, e sobe uma pasta (../) porque o arquivo
// real está em src/entities/, não em src/entities/tests/.
import { Conteudo, ConteudoJSON } from '../conteudo.js';
// Usado nos testes de ano de lançamento, para não fixar um valor "mágico"
// que ficaria desatualizado com o tempo.
const anoAtual = new Date().getFullYear();
// Função auxiliar (factory) que gera um conjunto de parâmetros válidos
// para criar um Conteudo. Cada teste pode sobrescrever só o campo que
// quer testar, sem precisar repetir todos os outros campos toda vez.
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
        ...overrides, // sobrescreve só os campos passados, mantendo o resto padrão
    };
}
// Testes do construtor: garantem que a instância é criada corretamente
// com dados válidos e que as regras de negócio (título, ano) são respeitadas.
describe('Conteudo - construtor', () => {
    it('deve criar uma instância com dados válidos', () => {
        const conteudo = new Conteudo(paramsValidos());
 // Confere se cada propriedade foi atribuída corretamente
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
// "genero" aceita string OU número; aqui testamos o caso numérico
    it('deve aceitar genero numérico', () => {
         // "genero" aceita string OU número; aqui testamos o caso numérico
        const conteudo = new Conteudo(paramsValidos({ genero: 3 }));
        expect(conteudo.genero).toBe(3);
    });

    it('deve usar 0 como avaliação padrão quando não informada (undefined)', () => {
        const params = paramsValidos();
        // @ts-expect-error simula avaliação ausente, já que o tipo do construtor exige o campo
        delete params.avaliacao;
          // Confirma que o "??" no construtor aplicou o valor padrão 0
        const conteudo = new Conteudo(params);
        expect(conteudo.avaliacao).toBe(0);
    });

    it('deve lançar erro se o título for vazio', () => {
        // Testa a regra de negócio: título vazio deve lançar erro específico
        expect(() => new Conteudo(paramsValidos({ titulo: '' })))
            .toThrow('O titulo do filme é obrigatório.');
    });

    it('deve lançar erro se o título contiver apenas espaços', () => {
         // Espaços em branco não contam como título válido (trim().length === 0)
        expect(() => new Conteudo(paramsValidos({ titulo: '   ' })))
            .toThrow('O titulo do filme é obrigatório.');
    });

    it('deve lançar erro se o ano de lançamento for menor que 1888', () => {
          // 1888 é o limite inferior (ano do primeiro filme da história)
        expect(() => new Conteudo(paramsValidos({ anoLancamento: 1887 })))
            .toThrow('Ano de lançamento inválido.');
    });

    it('deve lançar erro se o ano de lançamento for maior que anoAtual + 5', () => {
         // Limite superior: não pode passar de 5 anos no futuro
        expect(() => new Conteudo(paramsValidos({ anoLancamento: anoAtual + 6 })))
            .toThrow('Ano de lançamento inválido.');
    });

    it('deve lançar erro se o ano de lançamento for 0', () => {
          // 0 cai na condição "!ano" da validação, então também deve falhar
        expect(() => new Conteudo(paramsValidos({ anoLancamento: 0 })))
            .toThrow('Ano de lançamento inválido.');
    });

    it('deve aceitar o ano limite inferior (1888)', () => {
         // Teste de "borda": 1888 é válido (limite inclusivo)
        const conteudo = new Conteudo(paramsValidos({ anoLancamento: 1888 }));
        expect(conteudo.anoLancamento).toBe(1888);
    });

    it('deve aceitar o ano limite superior (anoAtual + 5)', () => {
          // Teste de "borda": anoAtual + 5 é válido (limite inclusivo)
        const conteudo = new Conteudo(paramsValidos({ anoLancamento: anoAtual + 5 }));
        expect(conteudo.anoLancamento).toBe(anoAtual + 5);
    });
});
// Testes dos setters: garantem que alterar título e ano depois de criado
// o objeto também respeita as mesmas regras de validação do construtor.
describe('Conteudo - setters', () => {
    it('deve atualizar o título com um valor válido', () => {
        const conteudo = new Conteudo(paramsValidos());
        conteudo.titulo = 'Novo Título';
        expect(conteudo.titulo).toBe('Novo Título');
    });

    it('deve lançar erro ao tentar definir título vazio', () => {
        // O setter reaproveita a validarTitulo, então deve lançar o mesmo erro
        const conteudo = new Conteudo(paramsValidos());
        expect(() => { conteudo.titulo = ''; })
            .toThrow('O titulo do filme é obrigatório.');
    });

    it('deve manter o título anterior se a atualização falhar', () => {
          // Importante: garante que, se a validação falhar, o valor antigo
        // NÃO é sobrescrito (o objeto não fica num estado inconsistente)
        const conteudo = new Conteudo(paramsValidos());
        try {
            conteudo.titulo = '';
        } catch {
             // erro esperado, ignorado de propósito
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
// Testes do método estático fromJSON: garantem que dados brutos (objeto
// ou string JSON) são validados e convertidos corretamente em um Conteudo,
// e que cada campo inválido gera uma mensagem de erro específica.
describe('Conteudo.fromJSON', () => {
    // JSON de referência usado como base em vários testes deste bloco
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
        // fromJSON também aceita uma string (faz o JSON.parse internamente)
        const conteudo = Conteudo.fromJSON(JSON.stringify(jsonValido));
        expect(conteudo.titulo).toBe('Interestelar');
    });

    it('deve aceitar genero numérico', () => {
        const conteudo = Conteudo.fromJSON({ ...jsonValido, genero: 5 });
        expect(conteudo.genero).toBe(5);
    });

    it('deve usar 0 como avaliação padrão quando o campo não é informado', () => {
         // Remove "avaliacao" do objeto (campo opcional) e confere o valor padrão
        const { avaliacao, ...semAvaliacao } = jsonValido;
        const conteudo = Conteudo.fromJSON(semAvaliacao);
        expect(conteudo.avaliacao).toBe(0);
    });

    it('deve lançar erro se os dados não forem um objeto', () => {
        // '42' é uma string válida em JSON.parse, mas vira o número 42 (não objeto)
        expect(() => Conteudo.fromJSON('42')).toThrow('JSON inválido: esperado um objeto.');
    });
  // typeof null === 'object', por isso precisa de checagem extra no código (=== null)
    it('deve lançar erro se os dados forem null', () => {
        expect(() => Conteudo.fromJSON(null)).toThrow('JSON inválido: esperado um objeto.');
    });

    // Teste parametrizado: roda o mesmo teste para cada campo da lista,
    // simulando ele como número (tipo errado) e conferindo a mensagem de erro
    it.each([
        'id', 'titulo', 'sinopse', 'capaUrl', 'diretor', 'tipo', 'direcao',
    ] as (keyof ConteudoJSON)[])('deve lançar erro se o campo "%s" não for string', (campo) => {
        const invalido = { ...jsonValido, [campo]: 123 };
        expect(() => Conteudo.fromJSON(invalido))
            .toThrow(`Campo "${String(campo)}" é obrigatório e deve ser uma string.`);
    });
    
    it('deve lançar erro se "genero" não for string nem número', () => {
        // boolean não é nem string nem número, deve falhar
        const invalido = { ...jsonValido, genero: true };
        expect(() => Conteudo.fromJSON(invalido))
            .toThrow('Campo "genero" é obrigatório e deve ser string ou número.');
    });

    it('deve lançar erro se "anoLancamento" não for número', () => {
        // Aqui o ano vem como string ('2014'), o que deve ser rejeitado
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
         // avaliacao é opcional, mas se vier, precisa ser numérica
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
         // Confirma que fromJSON chama a mesma validarTitulo usada no construtor
        const invalido = { ...jsonValido, anoLancamento: 1800 };
        expect(() => Conteudo.fromJSON(invalido))
            .toThrow('Ano de lançamento inválido.');
    });
});
// Testes do método toJSON: garantem que a instância é serializada
// corretamente de volta para um objeto simples, e que o "round-trip"
// (instância -> JSON -> instância) preserva os mesmos dados.
describe('Conteudo - toJSON', () => {
    it('deve serializar a instância corretamente, convertendo id para string', () => {
        const conteudo = new Conteudo(paramsValidos({ id: '7' }));
        const json = conteudo.toJSON();
// toEqual compara o objeto inteiro, campo a campo
        expect(json).toEqual({
            id: '7',// confirma que o id sai como string (String(this._id) no código)
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
           // Cria um Conteudo, serializa, reconstrói via fromJSON e confere
        // se o resultado final é idêntico ao original
        const original = new Conteudo(paramsValidos());
        const clone = Conteudo.fromJSON(original.toJSON());

        expect(clone.toJSON()).toEqual(original.toJSON());
    });
});
