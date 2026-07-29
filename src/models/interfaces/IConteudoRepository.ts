import { Conteudo } from '../../entities/conteudo';

export interface IConteudoRepository {
    listarTodos(): Promise<Conteudo[]>;
    buscarPorId(id: string): Promise<Conteudo | null>;
    buscarPorGenero(genero: string): Promise<Conteudo[]>;
    criar(filme: Conteudo): Promise<Conteudo>;
    atualizar(id: string, filme: Conteudo): Promise<Conteudo | null>;
    remover(id: string): Promise<boolean>;
}