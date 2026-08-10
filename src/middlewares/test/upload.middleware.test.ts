import { FileFilterCallback } from 'multer';
import { Request } from 'express';
import {
    filtroDeArquivo,
    montarUrlArquivo,
    ArquivoEnviado,
} from '../upload.middleware';

/**
 * Testes unitários para o middleware de upload de arquivos.
 *
 * @remarks
 * O `upload` (instância configurada do multer) e a lógica de
 * armazenamento em disco (`storage`) não são testados aqui como unidade,
 * pois dependem de um fluxo real de multipart/form-data — isso deve ser
 * coberto por um teste de integração (`supertest`) numa rota que utilize
 * o middleware. Aqui testamos isoladamente apenas as partes que são
 * funções puras ou que recebem um `file` já mockado: `filtroDeArquivo`
 * e `montarUrlArquivo`.
 */
describe('Upload middleware', () => {

    /**
     * Cria um mock parcial de `ArquivoEnviado` para os testes.
     *
     * @param mimetype - Tipo MIME simulado do arquivo enviado.
     * @returns Objeto parcial de `ArquivoEnviado` contendo apenas os
     * campos necessários para testar o filtro de tipo.
     */
    function criarArquivoMock(mimetype: string): Partial<ArquivoEnviado> {
        return {
            fieldname: 'imagem',
            originalname: 'foto.jpg',
            encoding: '7bit',
            mimetype,
            size: 1024,
        };
    }

    /**
     * describe: filtroDeArquivo
     *
     * Testa a função responsável por aceitar ou rejeitar arquivos
     * enviados com base no tipo MIME.
     */
    describe('filtroDeArquivo', () => {

        // Testa se arquivos com mimetype permitido são aceitos
        test.each(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])(
            'deve aceitar arquivo com mimetype permitido: %s',
            (mimetype) => {
                const req = {} as Request;
                const file = criarArquivoMock(mimetype) as ArquivoEnviado;
                const cb: FileFilterCallback = jest.fn();

                filtroDeArquivo(req, file, cb);

                expect(cb).toHaveBeenCalledWith(null, true);
            }
        );

        // Testa se um arquivo com mimetype não permitido é rejeitado com erro
        test('deve rejeitar arquivo com mimetype não permitido', () => {
            const req = {} as Request;
            const file = criarArquivoMock('application/pdf') as ArquivoEnviado;
            const cb: FileFilterCallback = jest.fn();

            filtroDeArquivo(req, file, cb);

            expect(cb).toHaveBeenCalledTimes(1);
            const erroRecebido = (cb as jest.Mock).mock.calls[0][0];
            expect(erroRecebido).toBeInstanceOf(Error);
            expect(erroRecebido.message).toBe(
                'Formato de arquivo não suportado. Envie uma imagem JPG, PNG ou WEBP.'
            );
        });

        // Testa se, ao rejeitar, o callback não é chamado com "true" (arquivo não deve ser aceito)
        test('não deve chamar cb com true quando o mimetype não for permitido', () => {
            const req = {} as Request;
            const file = criarArquivoMock('text/plain') as ArquivoEnviado;
            const cb: FileFilterCallback = jest.fn();

            filtroDeArquivo(req, file, cb);

            expect(cb).not.toHaveBeenCalledWith(null, true);
        });
    });

    /**
     * describe: montarUrlArquivo
     *
     * Testa a função pura responsável por montar a URL pública
     * de acesso a um arquivo enviado.
     */
    describe('montarUrlArquivo', () => {

        // Testa se a URL pública é montada corretamente a partir do nome do arquivo
        test('deve retornar o caminho público correto para um nome de arquivo', () => {
            const resultado = montarUrlArquivo('imagem.png');

            expect(resultado).toBe('/uploads/imagem.png');
        });

        // Testa se nomes de arquivo com caracteres especiais/únicos são preservados na URL
        test('deve preservar o nome do arquivo exatamente como recebido', () => {
            const nomeArquivo = '1699999999999-123456789.webp';

            const resultado = montarUrlArquivo(nomeArquivo);

            expect(resultado).toBe(`/uploads/${nomeArquivo}`);
        });
    });
});
