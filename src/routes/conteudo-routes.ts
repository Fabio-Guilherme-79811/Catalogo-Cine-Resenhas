import { Router, Request, Response } from 'express';
import { isAuthenticated, isAdmin, AuthenticatedRequest } from '../middlewares/auth-middlewares';

const router = Router();

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

router.get('/filmes', (req: Request, res: Response) => {
  const { genero } = req.query;

  let resultado = filmes.filter((f) => f.publicado);
  if (genero) {
    resultado = resultado.filter(
      (f) => f.genero.toLowerCase() === String(genero).toLowerCase()
    );
  }

  res.json(resultado);
});

router.get('/filmes/:id', (req: Request, res: Response) => {
  const filme = filmes.find((f) => f.id === req.params.id && f.publicado);

  if (!filme) {
    res.status(404).json({ mensagem: 'Filme não encontrado.' });
    return;
  }

  res.json(filme);
});

router.post('/filmes', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
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
});

router.put('/filmes/:id', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
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
});

router.delete('/filmes/:id', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
  const index = filmes.findIndex((f) => f.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ mensagem: 'Filme não encontrado.' });
    return;
  }

  filmes.splice(index, 1);
  res.json({ mensagem: 'Filme removido do catálogo com sucesso.' });
});

export interface Opiniao {
  id: string;
  filmeId: string;
  usuarioId: string;
  usuarioNome: string;
  nota: number; 
  comentario: string;
  criadoEm: string;
}

const opinioes: Opiniao[] = [];

const JANELA_EDICAO_HORAS = 24;

function dentroDaJanelaDeEdicao(opiniao: Opiniao): boolean {
  const criadoEm = new Date(opiniao.criadoEm).getTime();
  const limiteMs = JANELA_EDICAO_HORAS * 60 * 60 * 1000;
  return Date.now() - criadoEm <= limiteMs;
}

router.get('/opinioes/filme/:filmeId', (req: Request, res: Response) => {
  const filmeId = String(req.params.filmeId);

  const filmeExiste = filmes.some((f) => f.id === filmeId);
  if (!filmeExiste) {
    res.status(404).json({ mensagem: 'Filme não encontrado.' });
    return;
  }

  const opinioesDoFilme = opinioes.filter((o) => o.filmeId === filmeId);
  res.json(opinioesDoFilme);
});

router.post('/opinioes/filme/:filmeId', isAuthenticated, (req: AuthenticatedRequest, res: Response) => {
  const filmeId = String(req.params.filmeId);
  const { nota, comentario } = req.body;

  const filme = filmes.find((f) => f.id === filmeId && f.publicado);
  if (!filme) {
    res.status(404).json({ mensagem: 'Filme não encontrado.' });
    return;
  }

  if (!nota || nota < 1 || nota > 5) {
    res.status(400).json({ mensagem: 'Informe uma nota entre 1 e 5.' });
    return;
  }

  if (!comentario || comentario.trim().length === 0) {
    res.status(400).json({ mensagem: 'Escreva um comentário com sua opinião.' });
    return;
  }

  const jaOpinou = opinioes.some(
    (o) => o.filmeId === filmeId && o.usuarioId === req.user?.id
  );
  if (jaOpinou) {
    res.status(409).json({
      mensagem: 'Você já avaliou esse filme. Utilize a edição para alterar sua avaliação (disponível por um tempo limitado).',
    });
    return;
  }

  const novaOpiniao: Opiniao = {
    id: String(opinioes.length + 1),
    filmeId,
    usuarioId: String(req.user!.id),
    usuarioNome: String(req.user!.nome),
    nota,
    comentario,
    criadoEm: new Date().toISOString(),
  };

  opinioes.push(novaOpiniao);
  res.status(201).json(novaOpiniao);
});

router.put('/opinioes/:id', isAuthenticated, (req: AuthenticatedRequest, res: Response) => {
  const opiniao = opinioes.find((o) => o.id === req.params.id);

  if (!opiniao) {
    res.status(404).json({ mensagem: 'Opinião não encontrada.' });
    return;
  }

  const ehAutor = opiniao.usuarioId === req.user?.id;
  const ehAdmin = req.user?.role === 'admin';

  if (!ehAdmin && !ehAutor) {
    res.status(403).json({ mensagem: 'Você só pode editar a sua própria avaliação.' });
    return;
  }

  if (!ehAdmin && ehAutor && !dentroDaJanelaDeEdicao(opiniao)) {
    res.status(403).json({
      mensagem: `O prazo de ${JANELA_EDICAO_HORAS}h para edição já expirou. Entre em contato com um administrador para alterar essa avaliação.`,
    });
    return;
  }

  const { nota, comentario } = req.body;

  if (nota !== undefined) {
    if (nota < 1 || nota > 5) {
      res.status(400).json({ mensagem: 'A nota deve estar entre 1 e 5.' });
      return;
    }
    opiniao.nota = nota;
  }

  if (comentario !== undefined) {
    opiniao.comentario = comentario;
  }

  res.json(opiniao);
});

router.delete('/opinioes/:id', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
  const index = opinioes.findIndex((o) => o.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ mensagem: 'Opinião não encontrada.' });
    return;
  }

  opinioes.splice(index, 1);
  res.json({ mensagem: 'Opinião removida com sucesso.' });
});

export default router;