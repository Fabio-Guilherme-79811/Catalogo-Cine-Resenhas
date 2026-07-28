import { randomUUID } from 'crypto';
import { Favorito, FavoritoJSON } from '../entities/Favorito';
import { JsonFileHandler } from './JsonFileHandler';
import { IFavoritoRepository } from './interfaces/IFavoritoRepository';

export class FavoritoRepository implements IFavoritoRepository {
    private readonly arquivo = new JsonFileHandler<FavoritoJSON>('favoritos.json');

    async listarTodos(): Promise<Favorito[]> {
        const dados = await this.arquivo.ler();
        return dados.map((item) => Favorito.fromJSON(item));
    }

    async listarPorUsuario(usuarioId: string): Promise<Favorito[]> {
        const favoritos = await this.listarTodos();
        return favoritos.filter((favorito) => favorito.usuarioId === usuarioId);
    }

    async buscar(usuarioId: string, filmeId: string): Promise<Favorito | null> {
        const favoritos = await this.listarTodos();
        return (
            favoritos.find(
                (favorito) => favorito.usuarioId === usuarioId && favorito.filmeId === filmeId
            ) ?? null
        );
    }

    async adicionar(favorito: Favorito): Promise<Favorito> {
        const existente = await this.buscar(favorito.usuarioId, favorito.filmeId);
        if (existente) return existente; // já favoritado: evita duplicidade sem lançar erro

        const favoritos = await this.listarTodos();
        const novoFavorito = new Favorito({
            id: favorito.id || randomUUID(),
            usuarioId: favorito.usuarioId,
            filmeId: favorito.filmeId,
            adicionadoEm: favorito.adicionadoEm,
        });

        favoritos.push(novoFavorito);
        await this.arquivo.escrever(favoritos.map((item) => item.toJSON()));
        return novoFavorito;
    }

    async remover(usuarioId: string, filmeId: string): Promise<boolean> {
        const favoritos = await this.listarTodos();
        const restantes = favoritos.filter(
            (favorito) => !(favorito.usuarioId === usuarioId && favorito.filmeId === filmeId)
        );
        if (restantes.length === favoritos.length) return false;

        await this.arquivo.escrever(restantes.map((item) => item.toJSON()));
        return true;
    }
}
