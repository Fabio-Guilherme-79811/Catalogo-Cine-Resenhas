import { Genero } from '../../entities/Genero';

export interface IGeneroRepository {
    listarTodos(): Promise<Genero[]>;
    buscarPorId(id: string): Promise<Genero | null>;
    buscarPorNome(nome: string): Promise<Genero | null>;
    criar(genero: Genero): Promise<Genero>;
    atualizar(id: string, genero: Genero): Promise<Genero | null>;
    remover(id: string): Promise<boolean>;
}
