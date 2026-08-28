import { UsuarioRepository } from '../UsuarioRepository';
import { Usuario } from '../../entities/Usuario';
import { JsonFileHandler } from '../JsonFileHandler';

// Mockamos o JsonFileHandler inteiro para que os testes não dependam
// de leitura/escrita real em disco. Assim testamos só a lógica do repositório.
jest.mock('../JsonFileHandler');

const JsonFileHandlerMock = JsonFileHandler as jest.MockedClass<typeof JsonFileHandler>;

// Helper para criar um usuário de teste rapidamente, evitando repetição
function criarUsuarioMock(
  overrides: Partial<{
    id: string;
    nome: string;
    email: string;
    senhaHash: string;
    role: 'comum' | 'admin';
    criadoEm: string;
  }> = {},
) {
  return new Usuario({
    id: overrides.id ?? '1',
    nome: overrides.nome ?? 'Fulano de Tal',
    email: overrides.email ?? 'fulano@teste.com',
    senhaHash: overrides.senhaHash ?? 'hash123',
    role: overrides.role ?? 'comum',
    criadoEm: overrides.criadoEm ?? new Date('2026-01-01').toISOString(),
  });
}

describe('UsuarioRepository', () => {
  let repository: UsuarioRepository;
  // Referências aos métodos mockados de ler/escrever do "arquivo" interno
  let lerMock: jest.Mock;
  let escreverMock: jest.Mock;

  beforeEach(() => {
    // Limpa todos os mocks entre os testes para evitar que um teste
    // influencie o resultado de outro (estado "vazando")
    jest.clearAllMocks();

    // Como `arquivo` é `private readonly` e instanciado dentro da classe,
    // pegamos a instância mockada criada automaticamente pelo jest.mock
    repository = new UsuarioRepository();
    const instanciaMockada = JsonFileHandlerMock.mock.instances[0] as jest.Mocked<
      JsonFileHandler<any>
    >;
    lerMock = instanciaMockada.ler as jest.Mock;
    escreverMock = instanciaMockada.escrever as jest.Mock;
  });

  describe('listarTodos', () => {
    it('deve retornar lista vazia quando não há usuários no arquivo', async () => {
      // Arrange: simula arquivo vazio
      lerMock.mockResolvedValue([]);

      // Act
      const resultado = await repository.listarTodos();

      // Assert
      expect(resultado).toEqual([]);
    });

    it('deve converter os dados JSON em instâncias de Usuario', async () => {
      // Arrange
      const usuario = criarUsuarioMock();
      lerMock.mockResolvedValue([usuario.toJSON()]);

      // Act
      const resultado = await repository.listarTodos();

      // Assert: cada item retornado deve ser uma instância real de Usuario
      expect(resultado).toHaveLength(1);
      expect(resultado[0]).toBeInstanceOf(Usuario);
      expect(resultado[0].email).toBe(usuario.email);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar o usuário correspondente ao id informado', async () => {
      const usuario = criarUsuarioMock({ id: 'abc' });
      lerMock.mockResolvedValue([usuario.toJSON()]);

      const resultado = await repository.buscarPorId('abc');

      expect(resultado).not.toBeNull();
      expect(resultado?.id).toBe('abc');
    });

    it('deve retornar null quando o id não existe', async () => {
      lerMock.mockResolvedValue([]);

      const resultado = await repository.buscarPorId('inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('buscarPorEmail (RNLF01)', () => {
    it('deve encontrar usuário normalizando o e-mail (trim + lowercase)', async () => {
      // O e-mail salvo já deve estar normalizado dentro da entidade Usuario
      const usuario = criarUsuarioMock({ email: 'teste@dominio.com' });
      lerMock.mockResolvedValue([usuario.toJSON()]);

      // Buscamos com espaços e caixa alta para validar a normalização na busca
      const resultado = await repository.buscarPorEmail('  TESTE@DOMINIO.COM  ');

      expect(resultado).not.toBeNull();
      expect(resultado?.email).toBe('teste@dominio.com');
    });

    it('deve retornar null quando o e-mail não é encontrado', async () => {
      lerMock.mockResolvedValue([]);

      const resultado = await repository.buscarPorEmail('naoexiste@teste.com');

      expect(resultado).toBeNull();
    });
  });

  describe('criar', () => {
    it('deve criar um novo usuário quando o e-mail ainda não está em uso', async () => {
      lerMock.mockResolvedValue([]);
      escreverMock.mockResolvedValue(undefined);
      const novoUsuario = criarUsuarioMock({ email: 'novo@teste.com' });

      const resultado = await repository.criar(novoUsuario);

      // Deve ter persistido o novo usuário
      expect(escreverMock).toHaveBeenCalledTimes(1);
      expect(resultado.email).toBe('novo@teste.com');
      expect(resultado).toBeInstanceOf(Usuario);
    });

    it('deve lançar erro (RNLF01) quando já existe usuário com o mesmo e-mail', async () => {
      const usuarioExistente = criarUsuarioMock({ email: 'duplicado@teste.com' });
      // Simula que a busca por e-mail (chamada internamente por listarTodos) já retorna esse usuário
      lerMock.mockResolvedValue([usuarioExistente.toJSON()]);

      const novoUsuario = criarUsuarioMock({ id: 'outro-id', email: 'duplicado@teste.com' });

      await expect(repository.criar(novoUsuario)).rejects.toThrow(
        'Já existe um usuário cadastrado com este e-mail.',
      );
      // Não deve ter tentado escrever no arquivo, já que a criação falhou
      expect(escreverMock).not.toHaveBeenCalled();
    });

    it('deve gerar um id automaticamente quando o usuário não possui um', async () => {
      lerMock.mockResolvedValue([]);
      escreverMock.mockResolvedValue(undefined);
      // Criamos um usuário sem id para forçar o uso do randomUUID interno
      const usuarioSemId = criarUsuarioMock({ id: '' });

      const resultado = await repository.criar(usuarioSemId);

      expect(resultado.id).toBeTruthy();
      expect(resultado.id).not.toBe('');
    });
  });

  describe('atualizar', () => {
    it('deve atualizar os dados de um usuário existente', async () => {
      const usuarioOriginal = criarUsuarioMock({ id: '1', nome: 'Nome Antigo' });
      lerMock.mockResolvedValue([usuarioOriginal.toJSON()]);
      escreverMock.mockResolvedValue(undefined);

      const dadosNovos = criarUsuarioMock({ id: '1', nome: 'Nome Novo' });
      const resultado = await repository.atualizar('1', dadosNovos);

      expect(resultado).not.toBeNull();
      expect(resultado?.nome).toBe('Nome Novo');
      expect(escreverMock).toHaveBeenCalledTimes(1);
    });

    it('deve manter a data de criação original ao atualizar', async () => {
      const dataOriginal = new Date('2020-05-05').toISOString();
      const usuarioOriginal = criarUsuarioMock({ id: '1', criadoEm: dataOriginal });
      lerMock.mockResolvedValue([usuarioOriginal.toJSON()]);
      escreverMock.mockResolvedValue(undefined);

      const dadosNovos = criarUsuarioMock({
        id: '1',
        criadoEm: new Date('2026-01-01').toISOString(),
      });
      const resultado = await repository.atualizar('1', dadosNovos);

      expect(resultado?.criadoEm).toEqual(dataOriginal);
    });

    it('deve retornar null quando o id não existe', async () => {
      lerMock.mockResolvedValue([]);

      const dadosNovos = criarUsuarioMock({ id: 'nao-existe' });
      const resultado = await repository.atualizar('nao-existe', dadosNovos);

      expect(resultado).toBeNull();
    });

    it('deve lançar erro (RNLF01) se o novo e-mail já pertence a outro usuário', async () => {
      const usuario1 = criarUsuarioMock({ id: '1', email: 'usuario1@teste.com' });
      const usuario2 = criarUsuarioMock({ id: '2', email: 'usuario2@teste.com' });
      lerMock.mockResolvedValue([usuario1.toJSON(), usuario2.toJSON()]);

      // Tenta atualizar o usuário 1 usando o e-mail que já pertence ao usuário 2
      const dadosConflitantes = criarUsuarioMock({ id: '1', email: 'usuario2@teste.com' });

      await expect(repository.atualizar('1', dadosConflitantes)).rejects.toThrow(
        'Já existe um usuário cadastrado com este e-mail.',
      );
      expect(escreverMock).not.toHaveBeenCalled();
    });
  });

  describe('remover', () => {
    it('deve remover o usuário e retornar true quando o id existe', async () => {
      const usuario = criarUsuarioMock({ id: '1' });
      lerMock.mockResolvedValue([usuario.toJSON()]);
      escreverMock.mockResolvedValue(undefined);

      const resultado = await repository.remover('1');

      expect(resultado).toBe(true);
      // Verifica que a lista escrita não contém mais o usuário removido
      expect(escreverMock).toHaveBeenCalledWith([]);
    });

    it('deve retornar false quando o id não existe', async () => {
      lerMock.mockResolvedValue([]);

      const resultado = await repository.remover('nao-existe');

      expect(resultado).toBe(false);
      // Não deve ter tentado escrever, já que nada foi removido
      expect(escreverMock).not.toHaveBeenCalled();
    });
  });
});
