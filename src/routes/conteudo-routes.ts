import { Router, Request, Response } from 'express';
import { isAuthenticated, isAdmin, AuthenticatedRequest } from '../middlewares/auth-middleware';
import { upload, montarUrlArquivo, ArquivoEnviado } from '../middlewares/upload.middleware';

/**
 * Requisição autenticada que também pode conter um arquivo enviado via multer.
 * Usa a interface própria ArquivoEnviado (ver upload.middleware.ts) em vez do
 * namespace `Express.Multer.File`, que depende de um merge de tipos que pode
 * não estar disponível em todos os ambientes.
 */
interface RequisicaoComArquivo extends AuthenticatedRequest {
  file?: ArquivoEnviado;
}

const router = Router();

/* ------------------------------------------------------------------ */
/*  FILMES (catálogo)                                                 */
/* ------------------------------------------------------------------ */

/**
 * Mock do catálogo de filmes.
 * Substitua por uma consulta real ao banco de dados.
 */
export interface Filme {
  id: string;
  titulo: string;
  sinopse: string;
  genero: string;
  anoLancamento: number;
  posterUrl?: string;
  publicado: boolean;
}

export const filmes: Filme[] = [
  {
    id: '1',
    titulo: 'Filme Exemplo 1',
    sinopse: 'Sinopse de exemplo do filme.',
    genero: 'Drama',
    anoLancamento: 2023,
    posterUrl: '/img/filmes/1.jpg',
    publicado: true,
  },
  {
    id: '2',
    titulo: 'Filme Exemplo 2',
    sinopse: 'Sinopse de exemplo do filme.',
    genero: 'Ação',
    anoLancamento: 2024,
    posterUrl: '/img/filmes/2.jpg',
    publicado: true,
  },
];

/**
 * GET /conteudo/filmes
 * Lista o catálogo de filmes publicados. Rota pública.
 * Suporta filtro opcional por gênero via query string (?genero=Drama) e
 * busca por título/sinopse via query string (?busca=termo).
 *
 * @remarks
 * `busca` é usado pela busca com debounce no front-end (ver
 * `public/js/search-debounce.js`), que consulta este endpoint via fetch
 * conforme o usuário digita, sem recarregar a página.
 */
router.get('/filmes', (req: Request, res: Response) => {
  try {
    const { genero, busca } = req.query;

    let resultado = filmes.filter((f) => f.publicado);

    if (genero) {
      resultado = resultado.filter(
        (f) => f.genero.toLowerCase() === String(genero).toLowerCase()
      );
    }

    if (busca) {
      const termo = String(busca).trim().toLowerCase();
      resultado = resultado.filter(
        (f) =>
          f.titulo.toLowerCase().includes(termo) ||
          f.sinopse.toLowerCase().includes(termo)
      );
    }

    res.json(resultado);
  } catch (erro) {
    console.error('Erro ao listar filmes do catálogo:', erro);
    res.status(500).json({ mensagem: 'Não foi possível listar os filmes do catálogo.' });
  }
});

/**
 * GET /conteudo/filmes/:id
 * Detalhe de um filme específico do catálogo. Rota pública.
 */
router.get('/filmes/:id', (req: Request, res: Response) => {
  try {
    const filme = filmes.find((f) => f.id === req.params.id && f.publicado);

    if (!filme) {
      res.status(404).json({ mensagem: 'Filme não encontrado.' });
      return;
    }

    res.json(filme);
  } catch (erro) {
    console.error('Erro ao buscar filme:', erro);
    res.status(500).json({ mensagem: 'Não foi possível buscar o filme.' });
  }
});

/**
 * POST /conteudo/filmes
 * Adiciona um novo filme ao catálogo. Restrito a administradores.
 */
router.post('/filmes', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { titulo, sinopse, genero, anoLancamento, posterUrl, publicado } = req.body;

    if (!titulo || !sinopse || !genero || !anoLancamento) {
      res.status(400).json({
        mensagem: 'Informe título, sinopse, gênero e ano de lançamento do filme.',
      });
      return;
    }

    const novoFilme: Filme = {
      id: String(filmes.length + 1),
      titulo,
      sinopse,
      genero,
      anoLancamento,
      posterUrl,
      publicado: publicado !== undefined ? Boolean(publicado) : true,
    };

    filmes.push(novoFilme);
    res.status(201).json(novoFilme);
  } catch (erro) {
    console.error('Erro ao adicionar filme:', erro);
    res.status(500).json({ mensagem: 'Não foi possível adicionar o filme.' });
  }
});

/**
 * PUT /conteudo/filmes/:id
 * Atualiza os dados de um filme do catálogo. Restrito a administradores.
 */
router.put('/filmes/:id', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const filme = filmes.find((f) => f.id === req.params.id);

    if (!filme) {
      res.status(404).json({ mensagem: 'Filme não encontrado.' });
      return;
    }

    const { titulo, sinopse, genero, anoLancamento, posterUrl, publicado } = req.body;
    if (titulo !== undefined) filme.titulo = titulo;
    if (sinopse !== undefined) filme.sinopse = sinopse;
    if (genero !== undefined) filme.genero = genero;
    if (anoLancamento !== undefined) filme.anoLancamento = anoLancamento;
    if (posterUrl !== undefined) filme.posterUrl = posterUrl;
    if (publicado !== undefined) filme.publicado = Boolean(publicado);

    res.json(filme);
  } catch (erro) {
    console.error('Erro ao atualizar filme:', erro);
    res.status(500).json({ mensagem: 'Não foi possível atualizar o filme.' });
  }
});

/**
 * DELETE /conteudo/filmes/:id
 * Remove um filme do catálogo. Restrito a administradores.
 */
router.delete('/filmes/:id', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const index = filmes.findIndex((f) => f.id === req.params.id);

    if (index === -1) {
      res.status(404).json({ mensagem: 'Filme não encontrado.' });
      return;
    }

    filmes.splice(index, 1);
    res.json({ mensagem: 'Filme removido do catálogo com sucesso.' });
  } catch (erro) {
    console.error('Erro ao remover filme:', erro);
    res.status(500).json({ mensagem: 'Não foi possível remover o filme.' });
  }
});

/**
 * POST /conteudo/filmes/:id/poster
 * Faz upload da imagem de pôster de um filme. Restrito a administradores.
 * Envie o arquivo em multipart/form-data, no campo "poster".
 */
router.post(
  '/filmes/:id/poster',
  isAuthenticated,
  isAdmin,
  upload.single('poster'),
  (req: RequisicaoComArquivo, res: Response) => {
    try {
      const filme = filmes.find((f) => f.id === req.params.id);

      if (!filme) {
        res.status(404).json({ mensagem: 'Filme não encontrado.' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ mensagem: 'Nenhum arquivo enviado. Use o campo "poster".' });
        return;
      }

      filme.posterUrl = montarUrlArquivo(req.file.filename);
      res.json({ mensagem: 'Pôster atualizado com sucesso.', filme });
    } catch (erro) {
      console.error('Erro ao fazer upload do pôster:', erro);
      res.status(500).json({ mensagem: 'Não foi possível atualizar o pôster do filme.' });
    }
  }
);


export default router;
