import { Avaliacao } from '../Avaliacao';

describe('Entidade Avaliacao', () => {

    // Avaliação usada como base na maioria dos testes
    const avaliacaoValida = {
        id: '1',
        filmeId: '10',
        usuarioId: '20',
        nota: 4.5,
        comentario: 'Muito bom!',
        dataCriacao: '2026-01-01T00:00:00.000Z'
    };

    // Verifica se o construtor cria a avaliação corretamente
    it('deve criar uma avaliação válida', () => {
        const avaliacao = new Avaliacao(avaliacaoValida);

        expect(avaliacao.id).toBe('1');
        expect(avaliacao.filmeId).toBe('10');
        expect(avaliacao.usuarioId).toBe('20');
        expect(avaliacao.nota).toBe(4.5);
        expect(avaliacao.comentario).toBe('Muito bom!');
        expect(avaliacao.dataCriacao).toBe('2026-01-01T00:00:00.000Z');
    });

    // Caso o comentário não seja informado, deve ficar vazio
    it('deve criar comentário vazio por padrão', () => {
        const avaliacao = new Avaliacao({
            id: '1',
            filmeId: '10',
            usuarioId: '20',
            nota: 5
        });

        expect(avaliacao.comentario).toBe('');
    });

    // Não deve aceitar nota menor que 1
    it('deve lançar erro para nota menor que 1', () => {
        expect(() =>
            new Avaliacao({
                ...avaliacaoValida,
                nota: 0
            })
        ).toThrow('A nota deve estar entre 1.0 e 5.0.');
    });

    // Não deve aceitar nota maior que 5
    it('deve lançar erro para nota maior que 5', () => {
        expect(() =>
            new Avaliacao({
                ...avaliacaoValida,
                nota: 6
            })
        ).toThrow('A nota deve estar entre 1.0 e 5.0.');
    });

    // A nota pode ter no máximo uma casa decimal
    it('deve lançar erro para nota com mais de uma casa decimal', () => {
        expect(() =>
            new Avaliacao({
                ...avaliacaoValida,
                nota: 4.55
            })
        ).toThrow('A nota deve ser um valor inteiro ou com no máximo uma casa decimal.');
    });

    // O filme é obrigatório
    it('deve lançar erro para filmeId vazio', () => {
        expect(() =>
            new Avaliacao({
                ...avaliacaoValida,
                filmeId: ''
            })
        ).toThrow('O filme avaliado é obrigatório.');
    });

    // O usuário é obrigatório
    it('deve lançar erro para usuarioId vazio', () => {
        expect(() =>
            new Avaliacao({
                ...avaliacaoValida,
                usuarioId: ''
            })
        ).toThrow('O usuário avaliador é obrigatório.');
    });

    // Deve permitir alterar a nota
    it('setter nota deve funcionar', () => {
        const avaliacao = new Avaliacao(avaliacaoValida);

        avaliacao.nota = 5;

        expect(avaliacao.nota).toBe(5);
    });

    // Deve permitir alterar o comentário
    it('setter comentario deve funcionar', () => {
        const avaliacao = new Avaliacao(avaliacaoValida);

        avaliacao.comentario = 'Excelente filme';

        expect(avaliacao.comentario).toBe('Excelente filme');
    });

    // O comentário deve ser salvo sem espaços extras
    it('setter comentario deve remover espaços', () => {
        const avaliacao = new Avaliacao(avaliacaoValida);

        avaliacao.comentario = '   Muito bom   ';

        expect(avaliacao.comentario).toBe('Muito bom');
    });

    // Deve retornar todos os dados corretamente
    it('toJSON deve retornar todos os campos', () => {
        const avaliacao = new Avaliacao(avaliacaoValida);

        expect(avaliacao.toJSON()).toEqual(avaliacaoValida);
    });

    // Deve criar uma avaliação usando um objeto
    it('fromJSON deve criar uma avaliação a partir de objeto', () => {
        const avaliacao = Avaliacao.fromJSON(avaliacaoValida);

        expect(avaliacao.nota).toBe(4.5);
        expect(avaliacao.comentario).toBe('Muito bom!');
    });

    // Deve criar uma avaliação usando uma string JSON
    it('fromJSON deve criar uma avaliação a partir de string JSON', () => {
        const json = JSON.stringify(avaliacaoValida);

        const avaliacao = Avaliacao.fromJSON(json);

        expect(avaliacao.nota).toBe(4.5);
    });

    // Deve gerar erro quando o JSON estiver incompleto
    it('fromJSON deve lançar erro para JSON inválido', () => {
        expect(() =>
            Avaliacao.fromJSON({
                nota: 5
            })
        ).toThrow();
    });

});