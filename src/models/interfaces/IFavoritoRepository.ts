import { Favorito } from '../../entities/Favorito';

export interface IFavoritoRepository {
    listarTodos(): Promise<Favorito[]>;
    listarPorUsuario(usuarioId: string): Promise<Favorito[]>;
    buscar(usuarioId: string, filmeId: string): Promise<Favorito | null>;
    adicionar(favorito: Favorito): Promise<Favorito>;
    remover(usuarioId: string, filmeId: string): Promise<boolean>;
}
