import { JsonFileHandler } from './JsonFileHandler';

/**
 * Formato bruto de uma visita registrada, persistido em `visitas.json`.
 */
export interface VisitaJSON {
  data: string; // ISO 8601
}

/**
 * Repositório responsável por registrar e contabilizar as visitas
 * recebidas pela landing page (GET /).
 *
 * @remarks
 * Substitui o valor mockado que antes era exibido no painel administrativo
 * (`visitasLandingPage`) por uma contagem real, persistida em disco assim
 * como os demais repositórios do projeto.
 */
export class VisitaRepository {
  private readonly arquivo = new JsonFileHandler<VisitaJSON>('visitas.json');

  /**
   * Registra uma nova visita à landing page, com o timestamp atual.
   */
  async registrar(): Promise<void> {
    const visitas = await this.arquivo.ler();
    visitas.push({ data: new Date().toISOString() });
    await this.arquivo.escrever(visitas);
  }

  /**
   * Conta o total de visitas registradas.
   *
   * @returns O número total de visitas já registradas.
   */
  async contarTotal(): Promise<number> {
    const visitas = await this.arquivo.ler();
    return visitas.length;
  }

  /**
   * Conta as visitas registradas nos últimos `dias` dias.
   *
   * @param dias - Janela de tempo, em dias, a considerar (padrão: 7).
   * @returns O número de visitas registradas dentro da janela informada.
   */
  async contarDesde(dias: number = 7): Promise<number> {
    const visitas = await this.arquivo.ler();
    const limite = Date.now() - dias * 24 * 60 * 60 * 1000;
    return visitas.filter((v) => new Date(v.data).getTime() >= limite).length;
  }
}
