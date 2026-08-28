// Importação da entidade Genero e da interface do repositório
import { Genero } from '../../../entities/Genero';
import { IGeneroRepository } from '../IGeneroRepository';

/**
 * Implementação em memória do repositório de Gêneros.
 * Utilizado para simular a persistência de dados nos testes unitários.
 */
class GeneroRepositoryInMemory implements IGeneroRepository {
  // Array interno para armazenar os gêneros em memória
  public items: Genero[] = [];

  /**
   * Adiciona e armazena um novo gênero no repositório.
   */
  async criar(genero: Genero): Promise<Genero> {
    this.items.push(genero);
    return genero;
  }

  /**
   * Retorna todos os gêneros cadastrados.
   */
  async listarTodos(): Promise<Genero[]> {
    return this.items;
  }

  /**
   * Busca um gênero pelo seu ID único.
   * Retorna o gênero encontrado ou null caso não exista.
   */
  async buscarPorId(id: string): Promise<Genero | null> {
    const genero = this.items.find((item) => item.id === id);
    return genero || null;
  }

  /**
   * Busca um gênero pelo nome (sem diferenciar maiúsculas e minúsculas).
   * Retorna o gênero encontrado ou null caso não exista.
   */
  async buscarPorNome(nome: string): Promise<Genero | null> {
    const genero = this.items.find((item) => item.nome.toLowerCase() === nome.toLowerCase());
    return genero || null;
  }

  /**
   * Atualiza um gênero existente pelo seu ID.
   * Retorna o gênero atualizado ou null se o ID não for encontrado.
   */
  async atualizar(id: string, genero: Genero): Promise<Genero | null> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    this.items[index] = genero;
    return genero;
  }

  /**
   * Remove um gênero pelo seu ID.
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

// Suíte de testes unitários para o repositório de gêneros
describe('IGeneroRepository Testes', () => {
  let repository: GeneroRepositoryInMemory;

  // Função auxiliar (factory) para gerar mocks de gênero nos testes
  const criarGeneroMock = (dados: Partial<Genero> = {}): Genero => {
    return {
      id: '1',
      nome: 'Ação',
      ...dados,
    } as Genero;
  };

  // Instancia um novo repositório limpo antes de cada teste
  beforeEach(() => {
    repository = new GeneroRepositoryInMemory();
  });

  // Testes para o método criar
  describe('criar', () => {
    it('deve criar e armazenar um novo gênero', async () => {
      const genero = criarGeneroMock();

      const resultado = await repository.criar(genero);

      expect(resultado).toEqual(genero);
      expect(repository.items).toHaveLength(1);
    });
  });

  // Testes para o método listarTodos
  describe('listarTodos', () => {
    it('deve retornar uma lista vazia quando não houver gêneros', async () => {
      const resultado = await repository.listarTodos();

      expect(resultado).toEqual([]);
    });

    it('deve retornar todos os gêneros cadastrados', async () => {
      const g1 = criarGeneroMock({ id: '1', nome: 'Ação' });
      const g2 = criarGeneroMock({ id: '2', nome: 'Comédia' });

      await repository.criar(g1);
      await repository.criar(g2);

      const resultado = await repository.listarTodos();

      expect(resultado).toHaveLength(2);
      expect(resultado).toEqual([g1, g2]);
    });
  });

  // Testes para o método buscarPorId
  describe('buscarPorId', () => {
    it('deve encontrar um gênero existente pelo ID', async () => {
      const genero = criarGeneroMock({ id: 'gen-123' });
      await repository.criar(genero);

      const resultado = await repository.buscarPorId('gen-123');

      expect(resultado).toEqual(genero);
    });

    it('deve retornar null se o gênero não for encontrado por ID', async () => {
      const resultado = await repository.buscarPorId('id-inexistente');

      expect(resultado).toBeNull();
    });
  });

  // Testes para o método buscarPorNome
  describe('buscarPorNome', () => {
    it('deve encontrar um gênero existente pelo nome', async () => {
      const genero = criarGeneroMock({ nome: 'Terror' });
      await repository.criar(genero);

      const resultado = await repository.buscarPorNome('Terror');

      expect(resultado).toEqual(genero);
    });

    it('deve ser case-insensitive ao buscar por nome', async () => {
      const genero = criarGeneroMock({ nome: 'Drama' });
      await repository.criar(genero);

      const resultado = await repository.buscarPorNome('drama');

      expect(resultado).toEqual(genero);
    });

    it('deve retornar null se o gênero não for encontrado por nome', async () => {
      const resultado = await repository.buscarPorNome('Ficção Científica');

      expect(resultado).toBeNull();
    });
  });

  // Testes para o método atualizar
  describe('atualizar', () => {
    it('deve atualizar um gênero existente', async () => {
      const generoOriginal = criarGeneroMock({ id: '1', nome: 'Nome Antigo' });
      await repository.criar(generoOriginal);

      const generoAtualizado = criarGeneroMock({ id: '1', nome: 'Nome Novo' });

      const resultado = await repository.atualizar('1', generoAtualizado);

      expect(resultado).toEqual(generoAtualizado);
      expect(repository.items[0].nome).toBe('Nome Novo');
    });

    it('deve retornar null ao tentar atualizar um ID inexistente', async () => {
      const genero = criarGeneroMock({ id: '1' });

      const resultado = await repository.atualizar('id-inexistente', genero);

      expect(resultado).toBeNull();
    });
  });

  // Testes para o método remover
  describe('remover', () => {
    it('deve remover um gênero existente e retornar true', async () => {
      const genero = criarGeneroMock({ id: '1' });
      await repository.criar(genero);

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
