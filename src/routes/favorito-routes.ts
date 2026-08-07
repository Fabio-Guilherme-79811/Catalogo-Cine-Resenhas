import { Router, Response } from 'express';
import { isAuthenticated, AuthenticatedRequest } from '../middlewares/auth-middleware';
import { Favorito } from '../entities/Favorito';
import { FavoritoRepository } from '../models/FavoritoRepository';
import { filmes } from './conteudo-routes';

const router = Router();
const favoritoRepository = new FavoritoRepository();

/**
 * Router responsável por gerenciar os filmes favoritados por cada usuário.
 *
 * @remarks
 * Usado pelo botão "Favoritar" na página de detalhes do filme
 * (ver `public/js/favorito-fetch.js`), que consome estas rotas via fetch
 * para favoritar/desfavoritar sem recarregar a página.
 */

/**
 * GET /filme/:filmeId
 * Verifica se o filme informado está favoritado pelo usuário autenticado.
 *
 * @route GET /filme/:filmeId
 * @param req - Requisição autenticada contendo `filmeId` nos parâmetros da rota.
 * @param res - Resposta HTTP com `{ favoritado: boolean }`.
 */
router.get('/filme/:filmeId', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const filmeId = String(req.params.filmeId);
        const favorito = await favoritoRepository.buscar(String(req.user!.id), filmeId);
        res.json({ favoritado: Boolean(favorito) });
    } catch (erro) {
        console.error('Erro ao verificar favorito:', erro);
        res.status(500).json({ mensagem: 'Não foi possível verificar o favorito.' });
    }
});

/**
 * POST /filme/:filmeId
 * Adiciona o filme informado aos favoritos do usuário autenticado.
 * Operação idempotente: favoritar um filme já favoritado não gera erro.
 *
 * @route POST /filme/:filmeId
 * @param req - Requisição autenticada contendo `filmeId` nos parâmetros da rota.
 * @param res - Resposta HTTP: erro 404 se o filme não existir, ou `{ favoritado: true }`.
 */
router.post('/filme/:filmeId', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const filmeId = String(req.params.filmeId);
        const filmeExiste = filmes.some((f) => f.id === filmeId);

        if (!filmeExiste) {
            res.status(404).json({ mensagem: 'Filme não encontrado.' });
            return;
        }

        const favorito = new Favorito({
            id: '', // gerado pelo repositório (randomUUID) em adicionar()
            usuarioId: String(req.user!.id),
            filmeId,
        });

        await favoritoRepository.adicionar(favorito);
        res.status(201).json({ favoritado: true });
    } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Não foi possível favoritar o filme.';
        res.status(400).json({ mensagem });
    }
});

/**
 * DELETE /filme/:filmeId
 * Remove o filme informado dos favoritos do usuário autenticado.
 *
 * @route DELETE /filme/:filmeId
 * @param req - Requisição autenticada contendo `filmeId` nos parâmetros da rota.
 * @param res - Resposta HTTP: erro 404 se o filme não estava favoritado, ou `{ favoritado: false }`.
 */
router.delete('/filme/:filmeId', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const filmeId = String(req.params.filmeId);
        const removido = await favoritoRepository.remover(String(req.user!.id), filmeId);

        if (!removido) {
            res.status(404).json({ mensagem: 'Este filme não estava nos seus favoritos.' });
            return;
        }

        res.json({ favoritado: false });
    } catch (erro) {
        console.error('Erro ao remover favorito:', erro);
        res.status(500).json({ mensagem: 'Não foi possível remover o favorito.' });
    }
});

/**
 * Router de favoritos, a ser montado na rota `/favoritos` da aplicação principal.
 */
export default router;
