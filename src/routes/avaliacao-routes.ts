import { Router, Request, Response } from 'express';
import { isAuthenticated, isAdmin, AuthenticatedRequest } from '../middlewares/auth-middleware';
import { filmes } from './conteudo-routes';
 
const router = Router();

// Representa uma avaliação (review) feita por um usuário sobre um filme
export interface Avaliacao {
    id: string;
    filmeId: string;
    usuarioId: string;
    usuarioNome: string;
    nota: number; // 1 a 5
    comentario: string;
    criadoEm: string;
  }
// "Banco de dados" em memória das avaliações
// OBS: como está em memória, os dados se perdem ao reiniciar o servidor
const avaliacoes: Avaliacao[] = [];
// Janela de tempo (em horas) em que o autor pode editar a própria avaliação
const JANELA_EDICAO_HORAS = 24;
// Verifica se uma avaliação ainda está dentro do prazo permitido para edição
// pelo próprio autor (comparando a data de criação com o tempo atual)
function dentroDaJanelaDeEdicao(avaliacao: Avaliacao): boolean {
    const criadoEm = new Date(avaliacao.criadoEm).getTime();
    const limiteMs = JANELA_EDICAO_HORAS * 60 * 60 * 1000;
    return Date.now() - criadoEm <= limiteMs;
  }
// Rota GET /filme/:filmeId: lista todas as avaliações de um filme específico
  router.get('/filme/:filmeId', (req: Request, res: Response) => {
    const filmeId = String(req.params.filmeId);
    // Verifica se o filme existe antes de buscar as avaliações
    const filmeExiste = filmes.some((f) => f.id === filmeId);
    if (!filmeExiste) {
      res.status(404).json({ mensagem: 'Filme não encontrado.' });
      return;
    }
   
    const avaliacoesDoFilme = avaliacoes.filter((a) => a.filmeId === filmeId);
    res.json(avaliacoesDoFilme);
  });
   // Rota GET /filme/:filmeId/media: calcula e retorna a média das notas
  // e o total de avaliações de um filme
  router.get('/filme/:filmeId/media', (req: Request, res: Response) => {
    const filmeId = String(req.params.filmeId);
    const avaliacoesDoFilme = avaliacoes.filter((a) => a.filmeId === filmeId);
   // Se não houver avaliações, retorna média 0 (evita divisão por zero)
    if (avaliacoesDoFilme.length === 0) {
      res.json({ media: 0, total: 0 });
      return;
    }
   
    const soma = avaliacoesDoFilme.reduce((acc, a) => acc + a.nota, 0);
    const media = Number((soma / avaliacoesDoFilme.length).toFixed(1));
   
    res.json({ media, total: avaliacoesDoFilme.length });
  });
    // Rota POST /filme/:filmeId: cria uma nova avaliação para um filme
  // Requer usuário autenticado
  router.post('/filme/:filmeId', isAuthenticated, (req: AuthenticatedRequest, res: Response) => {
    const filmeId = String(req.params.filmeId);
    const { nota, comentario } = req.body;
    // Só permite avaliar filmes que existem e estão publicados
    const filme = filmes.find((f) => f.id === filmeId && f.publicado);
    if (!filme) {
      res.status(404).json({ mensagem: 'Filme não encontrado.' });
      return;
    }
    // Validação da nota: deve existir e estar entre 1 e 5
    if (!nota || nota < 1 || nota > 5) {
      res.status(400).json({ mensagem: 'Informe uma nota entre 1 e 5.' });
      return;
    }
   
    // Validação do comentário: não pode ser vazio ou só espaços em branco
    if (!comentario || comentario.trim().length === 0) {
      res.status(400).json({ mensagem: 'Escreva um comentário com sua avaliação.' });
      return;
    }
   // Impede que o mesmo usuário avalie o mesmo filme mais de uma vez
    const jaAvaliou = avaliacoes.some(
      (a) => a.filmeId === filmeId && a.usuarioId === req.user?.id
    );
    if (jaAvaliou) {
      res.status(409).json({
        mensagem: 'Você já avaliou esse filme. Utilize a edição para alterar sua avaliação (disponível por um tempo limitado).',
      });
      return;
    }
   // Monta a nova avaliação
    // ATENÇÃO: o id é gerado com base no tamanho do array (avaliacoes.length + 1),
    // o que pode gerar ids duplicados após exclusões (ex: remover o item 3 de 3
    // e criar um novo gera outro id "3"). O ideal seria usar um UUID ou contador incremental à parte.
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
// Rota PUT /:id: edita uma avaliação existente
  // Requer usuário autenticado
  router.put('/:id', isAuthenticated, (req: AuthenticatedRequest, res: Response) => {
    const avaliacao = avaliacoes.find((a) => a.id === req.params.id);
   
    if (!avaliacao) {
      res.status(404).json({ mensagem: 'Avaliação não encontrada.' });
      return;
    }
   // Verifica permissão: só o autor da avaliação ou um admin pode editar
    const ehAutor = avaliacao.usuarioId === req.user?.id;
    const ehAdmin = req.user?.role === 'admin';
   
    if (!ehAdmin && !ehAutor) {
      res.status(403).json({ mensagem: 'Você só pode editar a sua própria avaliação.' });
      return;
    }
    // Se for o autor (e não admin), só pode editar dentro da janela de tempo permitida.
    // Admins podem editar a qualquer momento.
    if (!ehAdmin && ehAutor && !dentroDaJanelaDeEdicao(avaliacao)) {
      res.status(403).json({
        mensagem: `O prazo de ${JANELA_EDICAO_HORAS}h para edição já expirou. Entre em contato com um administrador para alterar essa avaliação.`,
      });
      return;
    }
   
    const { nota, comentario } = req.body;
   // Atualiza a nota apenas se foi enviada, validando o intervalo permitido
    if (nota !== undefined) {
      if (nota < 1 || nota > 5) {
        res.status(400).json({ mensagem: 'A nota deve estar entre 1 e 5.' });
        return;
      }
      avaliacao.nota = nota;
    }
    // Atualiza o comentário apenas se foi enviado
    // OBS: diferente da rota POST, aqui não há validação de comentário vazio/em branco
    if (comentario !== undefined) {
      avaliacao.comentario = comentario;
    }
   
    res.json(avaliacao);
  });
   // Rota DELETE /:id: remove uma avaliação
  // Restrita a administradores autenticados
  router.delete('/:id', isAuthenticated, isAdmin, (req: AuthenticatedRequest, res: Response) => {
    const index = avaliacoes.findIndex((a) => a.id === req.params.id);
   
    if (index === -1) {
      res.status(404).json({ mensagem: 'Avaliação não encontrada.' });
      return;
    }
   
    avaliacoes.splice(index, 1);
    res.json({ mensagem: 'Avaliação removida com sucesso.' });
  });
   // Exporta o router para ser montado na rota /avaliacoes da aplicação principal
  export default router;