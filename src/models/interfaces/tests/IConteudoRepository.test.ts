import { Conteudo } from '../../../entities/conteudo';
import { IConteudoRepository } from '../IConteudoRepository';

class ConteudoRepositoryInMemory implements IConteudoRepository {
  public items: Conteudo[] = [];

  async criar(conteudo: Conteudo): Promise<Conteudo> {
    this.items.push(conteudo);
    return conteudo;
  }

  async listarTodos(): Promise<Conteudo[]> {
    return this.items;
  }

  async buscarPorId(id: string): Promise<Conteudo | null> {
    const conteudo = this.items.find((item) => item.id === id);
    return conteudo || null;
  }

  async buscarPorGenero(genero: string): Promise<Conteudo[]> {
    return this.items.filter((item) => item.genero === genero);
  }

  async atualizar(id: string, filme: Conteudo): Promise<Conteudo | null> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    this.items[index] = filme;
    return filme;
  }

  async remover(id: string): Promise<boolean> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    this.items.splice(index, 1);
    return true;
  }
}

describe('IConteudoRepository Testes', () => {
  let repository: ConteudoRepositoryInMemory;

  const criarConteudoMock = (dados: Partial<Conteudo> = {}): Conteudo => {
    return {
      id: '1',
      titulo: 'Inception',
      genero: 'Ação',
      ...dados,
    } as Conteudo;
  };

  beforeEach(() => {
    repository = new ConteudoRepositoryInMemory();
  });

  describe('criar', () => {
    it('deve criar e armazenar um novo conteúdo', async () => {
      const conteudo = criarConteudoMock();

      const resultado = await repository.criar(conteudo);

      expect(resultado).toEqual(conteudo);
      expect(repository.items).toHaveLength(1);
      expect(repository.items[0]).toEqual(conteudo);
    });
  });

  describe('listarTodos', () => {
    it('deve retornar uma lista vazia quando não houver conteúdos', async () => {
      const resultado = await repository.listarTodos();

      expect(resultado).toEqual([]);
    });

    it('deve retornar todos os conteúdos cadastrados', async () => {
      const c1 = criarConteudoMock({ id: '1', titulo: 'Filme A' });
      const c2 = criarConteudoMock({ id: '2', titulo: 'Filme B' });

      await repository.criar(c1);
      await repository.criar(c2);

      const resultado = await repository.listarTodos();

      expect(resultado).toHaveLength(2);
      expect(resultado).toEqual([c1, c2]);
    });
  });

  describe('buscarPorId', () => {
    it('deve encontrar um conteúdo existente pelo ID', async () => {
      const conteudo = criarConteudoMock({ id: 'abc-123' });
      await repository.criar(conteudo);

      const resultado = await repository.buscarPorId('abc-123');

      expect(resultado).toEqual(conteudo);
    });

    it('deve retornar null se o conteúdo não for encontrado', async () => {
      const resultado = await repository.buscarPorId('id-inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('buscarPorGenero', () => {
    it('deve filtrar os conteúdos pelo gênero correto', async () => {
      const c1 = criarConteudoMock({ id: '1', genero: 'Terror' });
      const c2 = criarConteudoMock({ id: '2', genero: 'Comédia' });
      const c3 = criarConteudoMock({ id: '3', genero: 'Terror' });

      await repository.criar(c1);
      await repository.criar(c2);
      await repository.criar(c3);

      const resultado = await repository.buscarPorGenero('Terror');

      expect(resultado).toHaveLength(2);
      expect(resultado).toEqual([c1, c3]);
    });

    it('deve retornar um array vazio se nenhum conteúdo corresponder ao gênero', async () => {
      await repository.criar(criarConteudoMock({ genero: 'Ação' }));

      const resultado = await repository.buscarPorGenero('Drama');

      expect(resultado).toEqual([]);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar um conteúdo existente', async () => {
      const conteudoOriginal = criarConteudoMock({ id: '1', titulo: 'Título Antigo' });
      await repository.criar(conteudoOriginal);

      const conteudoAtualizado = criarConteudoMock({ id: '1', titulo: 'Título Novo' });

      const resultado = await repository.atualizar('1', conteudoAtualizado);

      expect(resultado).toEqual(conteudoAtualizado);
      expect(repository.items[0].titulo).toBe('Título Novo');
    });

    it('deve retornar null ao tentar atualizar um ID inexistente', async () => {
      const conteudo = criarConteudoMock({ id: '1' });

      const resultado = await repository.atualizar('id-inexistente', conteudo);

      expect(resultado).toBeNull();
    });
  });

  describe('remover', () => {
    it('deve remover um conteúdo existente e retornar true', async () => {
      const conteudo = criarConteudoMock({ id: '1' });
      await repository.criar(conteudo);

      const resultado = await repository.remover('1');

      expect(resultado).toBe(true);
      expect(repository.items).toHaveLength(0);
    });

    it('deve retornar false ao tentar remover um ID inexistente', async () => {
      const resultado = await repository.remover('id-inexistente');

      expect(resultado).toBe(false);
    });
  });
});