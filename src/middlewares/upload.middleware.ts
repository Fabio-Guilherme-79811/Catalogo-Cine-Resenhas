import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const PASTA_UPLOADS = path.join(__dirname, '..', '..', 'public', 'uploads');

if (!fs.existsSync(PASTA_UPLOADS)) {
  fs.mkdirSync(PASTA_UPLOADS, { recursive: true });
}
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, PASTA_UPLOADS);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const extensao = path.extname(file.originalname);
    const nomeUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;
    cb(null, nomeUnico);
  },
});

function filtroDeArquivo(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
    cb(new Error('Formato de arquivo não suportado. Envie uma imagem JPG, PNG ou WEBP.'));
    return;
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter: filtroDeArquivo,
  limits: { fileSize: TAMANHO_MAXIMO_BYTES },
});

export function montarUrlArquivo(nomeArquivo: string): string {
  return `/uploads/${nomeArquivo}`;
}