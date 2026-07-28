import { Avaliacao } from '../../entities/Avaliacao';

export interface IAvaliacaoRepository {
    listarTodas(): Promise<Avaliacao[]>;
    buscarPorId(id: string): Promise<Avaliacao | null>;
    listarPorFilme(filmeId: string): Promise<Avaliacao[]>;
    buscarPorUsuarioEFilme(usuarioId: string, filmeId: string): Promise<Avaliacao | null>;
    criarOuAtualizar(avaliacao: Avaliacao): Promise<Avaliacao>;
    remover(id: string): Promise<boolean>;
    calcularMediaDoFilme(filmeId: string): Promise<number>;
}
