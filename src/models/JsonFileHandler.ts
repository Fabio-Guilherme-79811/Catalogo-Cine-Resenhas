// Camada de acesso a arquivo compartilhada por todos os repositórios.
// Isola o "como" persistimos (JSON em disco) do "o que" cada repositório faz,
// para que trocar a forma de persistência no futuro não exija mexer nas entidades.

import fs from 'fs/promises';
import path from 'path';

/**
 * Handler genérico de leitura e escrita de arquivos JSON em disco 
 * 
 * Cada instância representa um arquivo específico dentro da pasta `dados/`,
 * localizada na raiz do projeto. Utilizando pelo repositórios para persistir 
 * arrays de entidades sem que prescisem lidar diretamente com o sistema de arquivos 
 * 
 * @typerParam T - Tipo dos itens armazenados no arquivo JSON (ex: `UsuarioJSON`).
 */
export class JsonFileHandler<T> {
    private readonly caminhoArquivo: string;

    /**
     * 
     * @param nomeArquivo - Nome do arquivo JSON (ex: `'usuarios.json'`), que será
     * resolvido dentro da pasta `dados/` na raiz do projeto.
     */
    constructor(nomeArquivo: string) {
        // dados/ fica na raiz do projeto, dois níveis acima de src/models
        this.caminhoArquivo = path.join(__dirname, '..', '..', 'dados', nomeArquivo);
    }

    /**
     * Lé e desserializa o conteudo do arquivo JSON
     * 
     * caso o arquivo não exista, ele é criado vazio automaticamente (via
     * {@link escrever}) e um array vazio é retornado, evitando que a aplicação quebre.
     * 
     * @returns Um array de itens do tipo  `T` lidos do arquivo, ou `[]` se o arquivo
     * estiver vazio ou não existir 
     * @throws {ERROR} Caso ocorra uma dalha de leitura diferente de "arquivo não encontrado".
     */
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

    /**
     * Serializa e grava os dados no arquivo JSON. sobescrevendo o conteúdo existente. 
     * 
     * Crua a pasta de destino recursivamente caso ainda não exista.
     * 
     * @param dados - Array de itens do tipo  `T` a serem persistidos.
     * @throws {ERROR} Caso ocorra um falha ao criar a pasta ou escrever o arquivo.
     */
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
