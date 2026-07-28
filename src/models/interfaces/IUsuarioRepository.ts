import { Usuario } from '../../entities/Usuario';

export interface IUsuarioRepository {
    listarTodos(): Promise<Usuario[]>;
    buscarPorId(id: string): Promise<Usuario | null>;
    buscarPorEmail(email: string): Promise<Usuario | null>;
    criar(usuario: Usuario): Promise<Usuario>;
    atualizar(id: string, usuario: Usuario): Promise<Usuario | null>;
    remover(id: string): Promise<boolean>;
}
