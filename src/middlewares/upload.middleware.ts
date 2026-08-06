import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { Request } from 'express';

/**
 * Representa um arquivo recebido através de um upload utilizando Multer.
 */
export interface ArquivoEnviado {
   /** Nome do campo do formulário utilizado no envio. */
    fieldname: string;

    /** Nome original do arquivo enviado pelo usuário. */
    originalname: string;

    /** Codificação do arquivo. */
    encoding: string;

    /** Tipo MIME do arquivo enviado. */
    mimetype: string;

    /** Tamanho do arquivo em bytes. */
    size: number;

    /** Stream de leitura do arquivo. */
    stream: Readable;

    /** Diretório onde o arquivo foi armazenado. */
    destination: string;

    /** Nome gerado para o arquivo no servidor. */
    filename: string;

    /** Caminho completo do arquivo armazenado. */
    path: string;

    /** Conteúdo do arquivo em buffer. */
    buffer: Buffer;
}

/**
 * Diretório responsável por armazenar os arquivos enviados.
 */
const PASTA_UPLOADS = path.join(__dirname, '..', '..', 'public', 'uploads');


/**
 * Cria a pasta de uploads caso ela ainda não exista.
 */
if (!fs.existsSync(PASTA_UPLOADS)) {
  fs.mkdirSync(PASTA_UPLOADS, { recursive: true });
}

/**
 * Lista de tipos MIME aceitos para upload.
 */
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Tamanho máximo permitido para arquivos enviados.
 *
 * Valor definido como 5MB.
 */
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;

/**
 * Configuração responsável pelo armazenamento físico dos arquivos enviados.
 *
 * Define:
 * - diretório de destino;
 * - geração de nomes únicos;
 * - preservação da extensão original.
 */
const storage = multer.diskStorage({
  destination: (req: Request, file: ArquivoEnviado, cb) => {
    cb(null, PASTA_UPLOADS);
  },
  filename: (req: Request, file: ArquivoEnviado, cb) => {
    const extensao = path.extname(file.originalname);
    const nomeUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;
    cb(null, nomeUnico);
  },
});

/**
 * Filtra os arquivos enviados verificando se possuem
 * um formato permitido.
 *
 * @param req Requisição HTTP contendo o upload.
 * @param file Arquivo enviado pelo usuário.
 * @param cb Função de retorno informando se o arquivo é aceito.
 *
 * @throws Error Caso o formato do arquivo não seja permitido.
 */
export function filtroDeArquivo(
  req: Request,
  file: ArquivoEnviado,
  cb: FileFilterCallback
): void {
  if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
    cb(new Error('Formato de arquivo não suportado. Envie uma imagem JPG, PNG ou WEBP.'));
    return;
  }
  cb(null, true);
}

/**
 * Middleware Multer configurado para receber uploads de imagens.
 *
 * Configura:
 * - armazenamento em disco;
 * - validação do tipo do arquivo;
 * - limite máximo de tamanho.
 */
export const upload = multer({
  storage,
  fileFilter: filtroDeArquivo,
  limits: { fileSize: TAMANHO_MAXIMO_BYTES },
});

/**
 * Monta a URL pública de acesso a um arquivo enviado.
 *
 * @param nomeArquivo Nome do arquivo armazenado.
 *
 * @returns Caminho público para acessar o arquivo.
 *
 * @example
 * ```ts
 * montarUrlArquivo('imagem.png');
 * // retorna "/uploads/imagem.png"
 * ```
 */
export function montarUrlArquivo(nomeArquivo: string): string {
  return `/uploads/${nomeArquivo}`;
}
