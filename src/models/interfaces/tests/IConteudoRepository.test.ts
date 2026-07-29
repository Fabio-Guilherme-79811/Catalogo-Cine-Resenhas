// Importação da entidade Conteudo e da interface do repositório
import { Conteudo } from '../../../entities/conteudo';
import { IConteudoRepository } from '../IConteudoRepository';

/**
 * Implementação em memória do repositório de Conteúdos.
 * Utilizado para simular o banco de dados nos testes unitários.
 */
class ConteudoRepositoryInMemory implements IConteudoRepository {
  // Array interno para armazenar os conteúdos em memória
  public items: Conteudo[] = [];

  /**
   * Adiciona e armazena um novo conteúdo no repositório.
   */
  async criar(conteudo: Conteudo): Promise<Conteudo> {
    this.items.push(conteudo);
    return conteudo;
  }

  /**
   * Retorna todos os conteúdos cadastrados.
   */
  async listarTodos(): Promise<Conteudo[]> {
    return this.items;
  }

  /**
   * Busca um conteúdo pelo seu ID único.
   * Retorna o conteúdo encontrado ou null caso não exista.
   */
  async buscarPorId(id: string): Promise<Conteudo | null> {
    const conteudo = this.items.find((item) => item.id === id);
    return conteudo || null;
  }

  /**
   * Filtra e retorna os conteúdos de um determinado gênero.
   */
  async buscarPorGenero(genero: string): Promise<Conteudo[]> {
    return this.items.filter((item) => item.genero === genero);
  }

  /**
   * Atualiza um conteúdo existente pelo seu ID.
   * Retorna o conteúdo atualizado ou null se o ID não for encontrado.
   */
  async atualizar(id: string, filme: Conteudo): Promise<Conteudo | null> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    this.items[index] = filme;
    return filme;
  }

  /**
   * Remove um conteúdo pelo seu ID.
   * Retorna true se foi removido com sucesso ou false se o ID não for encontrado.
   */
  async remover(id: string): Promise<boolean> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    this.items.splice(index, 1);
    return true;
  }
}

// Suíte de testes unitários para o repositório de conteúdos
describe('IConteudoRepository Testes', () => {
  let repository: ConteudoRepositoryInMemory;

  // Função auxiliar (factory) para gerar mocks de conteúdos nos testes
  const criarConteudoMock = (dados: Partial<Conteudo> = {}): Conteudo => {
    return {
      id: '1',
      titulo: 'Inception',
      genero: 'Ação',
      ...dados,
    } as Conteudo;
  };

  // Instancia um novo repositório limpo antes de cada teste
  beforeEach(() => {
    repository = new ConteudoRepositoryInMemory();
  });

  // Testes para o método criar
  describe('criar', () => {
    it('deve criar e armazenar um novo conteúdo', async () => {
      const conteudo = criarConteudoMock();

      const resultado = await repository.criar(conteudo);

      expect(resultado).toEqual(conteudo);
      expect(repository.items).toHaveLength(1);
      expect(repository.items[0]).toEqual(conteudo);
    });
  });

  // Testes para o método listarTodos
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

  // Testes para o método buscarPorId
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

  // Testes para o método buscarPorGenero
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

  // Testes para o método atualizar
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


  
  // Testes para o método remover
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

