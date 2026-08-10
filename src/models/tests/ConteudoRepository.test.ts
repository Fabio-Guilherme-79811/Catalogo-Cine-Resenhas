import { Conteudo, ConteudoJSON } from '../../entities/conteudo';
import { IConteudoRepository } from '../interfaces/IConteudoRepository';

// Função auxiliar de conversão
function converterParaEntidade(dados: ConteudoJSON): Conteudo {
    return new Conteudo(dados);
}

// Mock que atende perfeitamente a interface IConteudoRepository
class ConteudoRepositoryMock implements IConteudoRepository {
    private conteudos: Conteudo[] = [];

    async listarTodos(): Promise<Conteudo[]> {
        return this.conteudos;
    }

    async buscarPorId(id: string): Promise<Conteudo | null> {
        const encontrado = this.conteudos.find((c) => String(c.id) === String(id));
        return encontrado || null;
    }

    async buscarPorGenero(genero: string): Promise<Conteudo[]> {
        return this.conteudos.filter((c) => String(c.generoId) === String(genero));
    }

    async criar(filme: Conteudo): Promise<Conteudo> {
        this.conteudos.push(filme);
        return filme;
    }

    async atualizar(id: string, filme: Conteudo): Promise<Conteudo | null> {
        const index = this.conteudos.findIndex((c) => String(c.id) === String(id));
        if (index !== -1) {
            this.conteudos[index] = filme;
            return filme;
        }
        return null;
    }

    async remover(id: string): Promise<boolean> {
        const tamanhoInicial = this.conteudos.length;
        this.conteudos = this.conteudos.filter((c) => String(c.id) !== String(id));
        return this.conteudos.length < tamanhoInicial;
    }
}

describe('ConteudoRepository', () => {
    let repository: ConteudoRepositoryMock;

    const dadosValidosJSON: ConteudoJSON = {
        id: '1',
        titulo: 'Inception',
        sinopse: 'Um filme sobre sonhos dentro de sonhos.',
        capaUrl: 'https://exemplo.com/capa.jpg',
        generoId: 10,
        subGenerosIds: [12, 15],
        anoLancamento: 2010,
        diretor: 'Christopher Nolan',
        tipo: 'Filme',
        duracao: 148,
        direcao: 'Christopher Nolan',
        avaliacao: 9.0
    };

    beforeEach(() => {
        repository = new ConteudoRepositoryMock();
    });

    test('deve converter ConteudoJSON para a entidade Conteudo corretamente', () => {
        const conteudo = converterParaEntidade(dadosValidosJSON);

        expect(conteudo).toBeInstanceOf(Conteudo);
        expect(conteudo.id).toBe(dadosValidosJSON.id);
        expect(conteudo.titulo).toBe(dadosValidosJSON.titulo);
        expect(conteudo.avaliacao).toBe(9.0);
    });

    test('deve criar e buscar um conteúdo no repositório', async () => {
        const conteudo = converterParaEntidade(dadosValidosJSON);

        await repository.criar(conteudo);
        const resultado = await repository.buscarPorId('1');

        expect(resultado).not.toBeNull();
        expect(resultado?.titulo).toBe('Inception');
    });

    test('deve retornar null ao buscar um id inexistente', async () => {
        const resultado = await repository.buscarPorId('999');
        expect(resultado).toBeNull();
    });

    test('deve remover um conteúdo do repositório', async () => {
        const conteudo = converterParaEntidade(dadosValidosJSON);
        await repository.criar(conteudo);

        const removido = await repository.remover('1');
        const busca = await repository.buscarPorId('1');

        expect(removido).toBe(true);
        expect(busca).toBeNull();
    });
});