import fs from 'fs/promises';
import { Conteudo } from '../../entities/conteudo';
import { ConteudoRepository } from '../ConteudoRepository';
import { JsonFileHandler } from '../JsonFileHandler';

jest.mock('fs/promises');

jest.mock('../JsonFileHandler', () => ({
    JsonFileHandler: jest.fn().mockImplementation(() => ({
        ler: jest.fn(),
        escrever: jest.fn(),
    })),
}));

describe('ConteudoRepository', () => {

    let repository: ConteudoRepository;
    let arquivoMock: any;

    const filme = new Conteudo({
        id: '1',
        titulo: 'Batman',
        sinopse: 'Filme de teste',
        capaUrl: 'batman.jpg',
        genero: 'Ação',
        anoLancamento: 2022,
        diretor: 'Matt Reeves',
        tipo: 'Filme',
        duracao: 176,
        direcao: 'Matt Reeves',
        avaliacao: 5,
    });

    beforeEach(() => {
        repository = new ConteudoRepository();
        arquivoMock = (JsonFileHandler as jest.Mock).mock.results[0].value;
        jest.clearAllMocks();
    });

    it('deve listar todos os conteúdos', async () => {

        arquivoMock.ler.mockResolvedValue([filme.toJSON()]);

        const resultado = await repository.listarTodos();

        expect(resultado).toHaveLength(1);
        expect(resultado[0].titulo).toBe('Batman');

    });

    it('deve buscar conteúdo por id', async () => {

        arquivoMock.ler.mockResolvedValue([filme.toJSON()]);

        const resultado = await repository.buscarPorId('1');

        expect(resultado).not.toBeNull();
        expect(resultado?.titulo).toBe('Batman');

    });

    it('deve retornar null quando não encontrar o id', async () => {

        arquivoMock.ler.mockResolvedValue([]);

        const resultado = await repository.buscarPorId('10');

        expect(resultado).toBeNull();

    });

    it('deve buscar conteúdo por gênero', async () => {

        arquivoMock.ler.mockResolvedValue([filme.toJSON()]);

        const resultado = await repository.buscarPorGenero('Ação');

        expect(resultado).toHaveLength(1);

    });

    it('deve criar um conteúdo', async () => {

        arquivoMock.ler.mockResolvedValue([]);
        arquivoMock.escrever.mockResolvedValue(undefined);

        const resultado = await repository.criar(filme);

        expect(resultado.titulo).toBe('Batman');
        expect(arquivoMock.escrever).toHaveBeenCalledTimes(1);

    });

    it('deve atualizar um conteúdo', async () => {

        arquivoMock.ler.mockResolvedValue([filme.toJSON()]);
        arquivoMock.escrever.mockResolvedValue(undefined);

        const atualizado = new Conteudo({
            id: '1',
            titulo: 'Batman 2',
            sinopse: 'Nova sinopse',
            capaUrl: 'batman2.jpg',
            genero: 'Ação',
            anoLancamento: 2023,
            diretor: 'Matt Reeves',
            tipo: 'Filme',
            duracao: 180,
            direcao: 'Matt Reeves',
            avaliacao: 4,
        });

        const resultado = await repository.atualizar('1', atualizado);

        expect(resultado).not.toBeNull();
        expect(resultado?.titulo).toBe('Batman 2');

    });

    it('deve retornar null ao atualizar conteúdo inexistente', async () => {

        arquivoMock.ler.mockResolvedValue([]);

        const resultado = await repository.atualizar('99', filme);

        expect(resultado).toBeNull();

    });

    it('deve remover um conteúdo', async () => {

        arquivoMock.ler.mockResolvedValue([filme.toJSON()]);
        arquivoMock.escrever.mockResolvedValue(undefined);

        (fs.unlink as jest.Mock).mockResolvedValue(undefined);

        const resultado = await repository.remover('1');

        expect(resultado).toBe(true);
        expect(fs.unlink).toHaveBeenCalled();

    });

    it('deve retornar false ao remover conteúdo inexistente', async () => {

        arquivoMock.ler.mockResolvedValue([]);

        const resultado = await repository.remover('1');

        expect(resultado).toBe(false);

    });

});