// Camada de acesso a arquivo compartilhada por todos os repositórios.
// Isola o "como" persistimos (JSON em disco) do "o que" cada repositório faz,
// para que trocar a forma de persistência no futuro não exija mexer nas entidades.

import fs from 'fs/promises';
import path from 'path';

export class JsonFileHandler<T> {
    private readonly caminhoArquivo: string;

    constructor(nomeArquivo: string) {
        // dados/ fica na raiz do projeto, dois níveis acima de src/models
        this.caminhoArquivo = path.join(__dirname, '..', '..', 'dados', nomeArquivo);
    }

    async ler(): Promise<T[]> {
        try {
            const conteudo = await fs.readFile(this.caminhoArquivo, 'utf-8');
            if (!conteudo.trim()) {
                return [];
            }
            return JSON.parse(conteudo) as T[];
        } catch (erro: any) {
            // Arquivo ainda não existe: cria vazio em vez de quebrar a aplicação
            if (erro.code === 'ENOENT') {
                await this.escrever([]);
                return [];
            }
            throw new Error(`Falha ao ler o arquivo "${this.caminhoArquivo}": ${erro.message}`);
        }
    }

    async escrever(dados: T[]): Promise<void> {
        try {
            const pasta = path.dirname(this.caminhoArquivo);
            await fs.mkdir(pasta, { recursive: true });
            await fs.writeFile(this.caminhoArquivo, JSON.stringify(dados, null, 2), 'utf-8');
        } catch (erro: any) {
            throw new Error(`Falha ao escrever no arquivo "${this.caminhoArquivo}": ${erro.message}`);
        }
    }
}
