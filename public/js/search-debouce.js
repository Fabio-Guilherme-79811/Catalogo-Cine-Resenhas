/**
 * Busca com debounce.
 *
 * O formulário de busca (#form-busca, na navbar) continua funcionando do
 * jeito tradicional para quem não tem JS (GET /catalogo?busca=...,
 * recarrega a página). Este script é uma melhoria progressiva: enquanto o
 * usuário digita, busca os resultados via fetch (sem recarregar nada) e
 * mostra um dropdown de sugestões logo abaixo do campo.
 */
(function () {
    const form = document.getElementById("form-busca");
    const input = document.getElementById("input-busca");
  
    if (!form || !input) return;
  
    const ATRASO_DEBOUNCE_MS = 350;
    const TAMANHO_MINIMO_BUSCA = 2;
  
    let temporizador = null;
    let controladorEmAndamento = null;
  
    // Monta o dropdown de resultados dinamicamente (não existe no HTML,
    // pra não precisar mexer no nav.ejs em toda página que usa a navbar).
    const dropdown = document.createElement("div");
    dropdown.className = "busca-resultados oculto";
    dropdown.setAttribute("role", "listbox");
    dropdown.setAttribute("aria-label", "Resultados da busca");
    form.appendChild(dropdown);
  
    function mostrarDropdown() {
      dropdown.classList.remove("oculto");
    }
  
    function esconderDropdown() {
      dropdown.classList.add("oculto");
    }
  
    function mostrarCarregando() {
      dropdown.innerHTML =
        '<div class="busca-resultados__carregando"><span class="spinner spinner--pequeno" aria-hidden="true"></span> Carregando...</div>';
      mostrarDropdown();
    }
  
    function mostrarErro() {
      dropdown.innerHTML =
        '<div class="busca-resultados__vazio">Não foi possível buscar agora. Tente de novo.</div>';
      mostrarDropdown();
    }
  
    function renderizarResultados(filmes) {
      if (!filmes.length) {
        dropdown.innerHTML =
          '<div class="busca-resultados__vazio">Nenhum filme encontrado.</div>';
        mostrarDropdown();
        return;
      }
  
      dropdown.innerHTML = filmes
        .slice(0, 8)
        .map(
          (filme) => `
            <a class="busca-resultados__item" href="/filmes/${encodeURIComponent(filme.id)}" role="option">
              <span class="busca-resultados__titulo">${escaparHtml(filme.titulo)}</span>
              <span class="busca-resultados__meta">${escaparHtml(String(filme.anoLancamento ?? ""))}</span>
            </a>
          `
        )
        .join("");
  
      mostrarDropdown();
    }
  
    function escaparHtml(texto) {
      const div = document.createElement("div");
      div.textContent = texto;
      return div.innerHTML;
    }
  
    async function buscar(termo) {
      // Cancela a busca anterior ainda em andamento, se houver — evita que
      // uma resposta antiga (mais lenta) sobrescreva uma mais nova.
      if (controladorEmAndamento) controladorEmAndamento.abort();
      controladorEmAndamento = new AbortController();
  
      mostrarCarregando();
  
      try {
        const resposta = await fetch(
          `/conteudo/filmes?busca=${encodeURIComponent(termo)}`,
          { signal: controladorEmAndamento.signal }
        );
  
        if (!resposta.ok) throw new Error("Falha na busca");
  
        const filmes = await resposta.json();
        renderizarResultados(filmes);
      } catch (erro) {
        if (erro.name === "AbortError") return; // busca cancelada, ignora
        console.error("Erro ao buscar filmes:", erro);
        mostrarErro();
      }
    }
  
    input.addEventListener("input", () => {
      const termo = input.value.trim();
  
      clearTimeout(temporizador);
  
      if (termo.length < TAMANHO_MINIMO_BUSCA) {
        esconderDropdown();
        return;
      }
  
      temporizador = setTimeout(() => buscar(termo), ATRASO_DEBOUNCE_MS);
    });
  
    // Fecha o dropdown ao clicar fora, e ao apertar Esc
    document.addEventListener("click", (evento) => {
      if (!form.contains(evento.target)) esconderDropdown();
    });
  
    input.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") esconderDropdown();
    });
  })();
  