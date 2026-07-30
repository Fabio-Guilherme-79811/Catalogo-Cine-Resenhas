import fs from 'fs/promises';
import { Conteudo } from '../../entities/conteudo';
import { ConteudoRepository } from '../ConteudoRepository';
import { JsonFileHandler } from '../JsonFileHandler';

// Mock do módulo fs/promises para impedir que os testes alterem arquivos reais.
jest.mock('fs/promises');

// Mock do JsonFileHandler para simular leitura e escrita do JSON em memória.
jest.mock('../JsonFileHandler', () => ({
    JsonFileHandler: jest.fn().mockImplementation(() => ({
        ler: jest.fn(),
        escrever: jest.fn(),
    })),
}));

describe('ConteudoRepository', () => {

    let repository: ConteudoRepository;
    let arquivoMock: any;

    // Conteúdo utilizado na maioria dos testes.
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

        // Cria uma nova instância do repositório antes de cada teste.
        repository = new ConteudoRepository();

        // Recupera os métodos mockados do JsonFileHandler.
        arquivoMock = (JsonFileHandler as jest.Mock).mock.results[0].value;

        // Limpa chamadas anteriores dos mocks.
        jest.clearAllMocks();
    });

    it('deve listar todos os conteúdos', async () => {

        // Simula um arquivo JSON contendo um único filme.
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

        // Simula arquivo vazio.
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

        // Simula que ainda não existe nenhum conteúdo salvo.
        arquivoMock.ler.mockResolvedValue([]);

        // Simula escrita realizada com sucesso.
        arquivoMock.escrever.mockResolvedValue(undefined);

        const resultado = await repository.criar(filme);

        expect(resultado.titulo).toBe('Batman');

        // Verifica se o método escrever foi chamado.
        expect(arquivoMock.escrever).toHaveBeenCalledTimes(1);

    });

    it('deve atualizar um conteúdo', async () => {

        arquivoMock.ler.mockResolvedValue([filme.toJSON()]);
        arquivoMock.escrever.mockResolvedValue(undefined);

        // Cria um novo objeto contendo as alterações.
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

        // Evita erro ao remover a capa antiga.
        (fs.unlink as jest.Mock).mockResolvedValue(undefined);

        const resultado = await repository.atualizar('1', atualizado);

        expect(resultado).not.toBeNull();
        expect(resultado?.titulo).toBe('Batman 2');

    });

    it('deve retornar null ao atualizar conteúdo inexistente', async () => {

        // Simula que não existe nenhum conteúdo cadastrado.
        arquivoMock.ler.mockResolvedValue([]);

        const resultado = await repository.atualizar('99', filme);

        expect(resultado).toBeNull();

    });

    it('deve remover um conteúdo', async () => {

        arquivoMock.ler.mockResolvedValue([filme.toJSON()]);
        arquivoMock.escrever.mockResolvedValue(undefined);

        // Simula remoção da imagem da capa.
        (fs.unlink as jest.Mock).mockResolvedValue(undefined);

        const resultado = await repository.remover('1');

        expect(resultado).toBe(true);

        // Confirma que o arquivo da capa foi removido.
        expect(fs.unlink).toHaveBeenCalled();

    });

    it('deve retornar false ao remover conteúdo inexistente', async () => {

        arquivoMock.ler.mockResolvedValue([]);

        const resultado = await repository.remover('1');

        expect(resultado).toBe(false);

    });

});