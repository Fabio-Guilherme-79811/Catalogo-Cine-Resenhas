import { Avaliacao } from '../../../entities/Avaliacao';
import { IAvaliacaoRepository } from '../IAvaliacaoRepository';

class AvaliacaoRepositoryInMemory implements IAvaliacaoRepository {
  public items: Avaliacao[] = [];

  async listarTodas(): Promise<Avaliacao[]> {
    return this.items;
  }

  async buscarPorId(id: string): Promise<Avaliacao | null> {
    const avaliacao = this.items.find((item) => item.id === id);
    return avaliacao || null;
  }

  async listarPorFilme(filmeId: string): Promise<Avaliacao[]> {
    return this.items.filter((item) => item.filmeId === filmeId);
  }

  async buscarPorUsuarioEFilme(
    usuarioId: string,
    filmeId: string
  ): Promise<Avaliacao | null> {
    const avaliacao = this.items.find(
      (item) => item.usuarioId === usuarioId && item.filmeId === filmeId
    );
    return avaliacao || null;
  }

  async criarOuAtualizar(avaliacao: Avaliacao): Promise<Avaliacao> {
    const index = this.items.findIndex((item) => item.id === avaliacao.id);

    if (index >= 0) {
      this.items[index] = avaliacao;
    } else {
      this.items.push(avaliacao);
    }

    return avaliacao;
  }

  async remover(id: string): Promise<boolean> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    this.items.splice(index, 1);
    return true;
  }

  async calcularMediaDoFilme(filmeId: string): Promise<number> {
    const avaliacoesDoFilme = this.items.filter(
      (item) => item.filmeId === filmeId
    );

    if (avaliacoesDoFilme.length === 0) {
      return 0;
    }

    const soma = avaliacoesDoFilme.reduce((acc, item) => acc + item.nota, 0);
    return soma / avaliacoesDoFilme.length;
  }
}

describe('IAvaliacaoRepository Testes', () => {
  let repository: IAvaliacaoRepository;

  const criarAvaliacaoMock = (dados: Partial<Avaliacao> = {}): Avaliacao => {
    return {
      id: '1',
      usuarioId: 'user-1',
      filmeId: 'filme-1',
      nota: 5,
      comentario: 'Muito bom!',
      ...dados,
    } as Avaliacao;
  };

  beforeEach(() => {
    repository = new AvaliacaoRepositoryInMemory();
  });

  describe('criarOuAtualizar', () => {
    it('deve criar uma nova avaliação quando ela não existir', async () => {
      const avaliacao = criarAvaliacaoMock();

      const resultado = await repository.criarOuAtualizar(avaliacao);

      expect(resultado).toEqual(avaliacao);
      expect(await repository.listarTodas()).toHaveLength(1);
    });

    it('deve atualizar uma avaliação se o ID já existir', async () => {
      const original = criarAvaliacaoMock({ id: '1', nota: 3 });
      await repository.criarOuAtualizar(original);

      const atualizada = criarAvaliacaoMock({ id: '1', nota: 5 });
      const resultado = await repository.criarOuAtualizar(atualizada);

      expect(resultado.nota).toBe(5);
      expect(await repository.listarTodas()).toHaveLength(1);
    });
  });

  describe('listarTodas', () => {
    it('deve retornar uma lista vazia quando não houver avaliações', async () => {
      const resultado = await repository.listarTodas();

      expect(resultado).toEqual([]);
    });

    it('deve listar todas as avaliações cadastradas', async () => {
      const a1 = criarAvaliacaoMock({ id: '1' });
      const a2 = criarAvaliacaoMock({ id: '2' });

      await repository.criarOuAtualizar(a1);
      await repository.criarOuAtualizar(a2);

      const resultado = await repository.listarTodas();

      expect(resultado).toHaveLength(2);
    });
  });

  describe('buscarPorId', () => {
    it('deve encontrar uma avaliação pelo ID', async () => {
      const avaliacao = criarAvaliacaoMock({ id: 'abc-123' });
      await repository.criarOuAtualizar(avaliacao);

      const resultado = await repository.buscarPorId('abc-123');

      expect(resultado).toEqual(avaliacao);
    });

    it('deve retornar null se a avaliação não existir', async () => {
      const resultado = await repository.buscarPorId('inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('listarPorFilme', () => {
    it('deve filtrar avaliações por filmeId', async () => {
      const a1 = criarAvaliacaoMock({ id: '1', filmeId: 'filme-A' });
      const a2 = criarAvaliacaoMock({ id: '2', filmeId: 'filme-B' });
      const a3 = criarAvaliacaoMock({ id: '3', filmeId: 'filme-A' });

      await repository.criarOuAtualizar(a1);
      await repository.criarOuAtualizar(a2);
      await repository.criarOuAtualizar(a3);

      const resultado = await repository.listarPorFilme('filme-A');

      expect(resultado).toHaveLength(2);
      expect(resultado).toEqual([a1, a3]);
    });
  });

  describe('buscarPorUsuarioEFilme', () => {
    it('deve encontrar avaliação específica de um usuário em um filme', async () => {
      const avaliacao = criarAvaliacaoMock({
        usuarioId: 'user-7',
        filmeId: 'filme-10',
      });
      await repository.criarOuAtualizar(avaliacao);

      const resultado = await repository.buscarPorUsuarioEFilme('user-7', 'filme-10');

      expect(resultado).toEqual(avaliacao);
    });

    it('deve retornar null se não houver avaliação para essa combinação', async () => {
      const resultado = await repository.buscarPorUsuarioEFilme('user-1', 'filme-x');

      expect(resultado).toBeNull();
    });
  });

  describe('calcularMediaDoFilme', () => {
    it('deve calcular a média das notas de um filme corretamente', async () => {
      await repository.criarOuAtualizar(
        criarAvaliacaoMock({ id: '1', filmeId: 'f1', nota: 4 })
      );
      await repository.criarOuAtualizar(
        criarAvaliacaoMock({ id: '2', filmeId: 'f1', nota: 5 })
      );
      await repository.criarOuAtualizar(
        criarAvaliacaoMock({ id: '3', filmeId: 'f1', nota: 3 })
      );

      const media = await repository.calcularMediaDoFilme('f1');

      expect(media).toBe(4);
    });

    it('deve retornar 0 para filmes sem avaliações', async () => {
      const media = await repository.calcularMediaDoFilme('filme-sem-avaliacoes');

      expect(media).toBe(0);
    });
  });

  describe('remover', () => {
    it('deve remover uma avaliação e retornar true', async () => {
      const avaliacao = criarAvaliacaoMock({ id: '1' });
      await repository.criarOuAtualizar(avaliacao);

      const resultado = await repository.remover('1');

      expect(resultado).toBe(true);
      expect(await repository.listarTodas()).toHaveLength(0);
    });

    it('deve retornar false ao tentar remover ID inexistente', async () => {
      const resultado = await repository.remover('inexistente');

      expect(resultado).toBe(false);
    });
  });
});