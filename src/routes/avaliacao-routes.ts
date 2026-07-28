import { Router, Request, Response } from 'express';
import { isAuthenticated, isAdmin, AuthenticatedRequest } from '../middlewares/auth-middleware';
import { filmes } from './conteudo-routes';
 
const router = Router();
 
export interface Avaliacao {
    id: string;
    filmeId: string;
    usuarioId: string;
    usuarioNome: string;
    nota: number; // 1 a 5
    comentario: string;
    criadoEm: string;
  }

const avaliacoes: Avaliacao[] = [];

const JANELA_EDICAO_HORAS = 24;

function dentroDaJanelaDeEdicao(avaliacao: Avaliacao): boolean {
    const criadoEm = new Date(avaliacao.criadoEm).getTime();
    const limiteMs = JANELA_EDICAO_HORAS * 60 * 60 * 1000;
    return Date.now() - criadoEm <= limiteMs;
  }

  router.get('/filme/:filmeId', (req: Request, res: Response) => {
    const filmeId = String(req.params.filmeId);
   
    const filmeExiste = filmes.some((f) => f.id === filmeId);
    if (!filmeExiste) {
      res.status(404).json({ mensagem: 'Filme não encontrado.' });
      return;
    }
   
    const avaliacoesDoFilme = avaliacoes.filter((a) => a.filmeId === filmeId);
    res.json(avaliacoesDoFilme);
  });
   
  router.get('/filme/:filmeId/media', (req: Request, res: Response) => {
    const filmeId = String(req.params.filmeId);
    const avaliacoesDoFilme = avaliacoes.filter((a) => a.filmeId === filmeId);
   
    if (avaliacoesDoFilme.length === 0) {
      res.json({ media: 0, total: 0 });
      return;
    }
   
    const soma = avaliacoesDoFilme.reduce((acc, a) => acc + a.nota, 0);
    const media = Number((soma / avaliacoesDoFilme.length).toFixed(1));
   
    res.json({ media, total: avaliacoesDoFilme.length });
  });
   
  router.post('/filme/:filmeId', isAuthenticated, (req: AuthenticatedRequest, res: Response) => {
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
      res.status(400).json({ mensagem: 'Escreva um comentário com sua avaliação.' });
      return;
    }
   
    const jaAvaliou = avaliacoes.some(
      (a) => a.filmeId === filmeId && a.usuarioId === req.user?.id
    );
    if (jaAvaliou) {
      res.status(409).json({
        mensagem: 'Você já avaliou esse filme. Utilize a edição para alterar sua avaliação (disponível por um tempo limitado).',
      });
      return;
    }
   
    const novaAvaliacao: Avaliacao = {
      id: String(avaliacoes.length + 1),
      filmeId,
      usuarioId: String(req.user!.id),
      usuarioNome: String(req.user!.nome),
      nota,
      comentario,
      criadoEm: new Date().toISOString(),
    };
   
    avaliacoes.push(novaAvaliacao);
    res.status(201).json(novaAvaliacao);
  });

  router.put('/:id', isAuthenticated, (req: AuthenticatedRequest, res: Response) => {
    const avaliacao = avaliacoes.find((a) => a.id === req.params.id);
   
    if (!avaliacao) {
      res.status(404).json({ mensagem: 'Avaliação não encontrada.' });
      return;
    }
   
    const ehAutor = avaliacao.usuarioId === req.user?.id;
    const ehAdmin = req.user?.role === 'admin';
   
    if (!ehAdmin && !ehAutor) {
      res.status(403).json({ mensagem: 'Você só pode editar a sua própria avaliação.' });
      return;
    }
   
    if (!ehAdmin && ehAutor && !dentroDaJanelaDeEdicao(avaliacao)) {
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
      avaliacao.nota = nota;
    }
   
    if (comentario !== undefined) {
      avaliacao.comentario = comentario;
    }
   
    res.json(avaliacao);
  });
   
  router.delete('/:id', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
    const index = avaliacoes.findIndex((a) => a.id === req.params.id);
   
    if (index === -1) {
      res.status(404).json({ mensagem: 'Avaliação não encontrada.' });
      return;
    }
   
    avaliacoes.splice(index, 1);
    res.json({ mensagem: 'Avaliação removida com sucesso.' });
  });
   
  export default router;