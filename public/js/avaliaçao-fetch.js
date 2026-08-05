/**
 * Envio de avaliação (detalhes.ejs).
 *
 * Substitui o que antes estava (de forma incompleta e com o id do filme
 * fixo em "1") em main.js. Cuida de três coisas:
 *  - transformar os cliques nas estrelas em valor de nota;
 *  - enviar a avaliação via fetch, com estado de carregamento no botão;
 *  - mostrar o resultado (sucesso/erro) no container de feedback global.
 */
(function () {
    const form = document.getElementById("form-avaliacao");
    if (!form) return;
  
    const filmeId = form.dataset.filmeId;
    const containerEstrelas = document.getElementById("estrelas-avaliacao");
    const inputNota = document.getElementById("input-nota");
    const campoComentario = document.getElementById("comentario");
    const erroComentario = form.querySelector('[data-erro-para="comentario"]');
    const botaoEnviar = document.getElementById("btn-enviar-avaliacao");
    const textoBotao = botaoEnviar ? botaoEnviar.querySelector(".btn__texto") : null;
  
    /* -------------------- Estrelas interativas -------------------- */
  
    function pintarEstrelas(nota) {
      if (!containerEstrelas) return;
      containerEstrelas.querySelectorAll("i").forEach((estrela) => {
        const valor = Number(estrela.dataset.valor);
        estrela.textContent = valor <= nota ? "\u2605" : "\u2606"; // ★ / ☆
      });
    }
  
    if (containerEstrelas) {
      containerEstrelas.querySelectorAll("i").forEach((estrela) => {
        estrela.addEventListener("click", () => {
          const nota = Number(estrela.dataset.valor);
          containerEstrelas.dataset.nota = String(nota);
          inputNota.value = String(nota);
          pintarEstrelas(nota);
        });
  
        // Pré-visualização ao passar o mouse, volta pra nota escolhida ao sair
        estrela.addEventListener("mouseenter", () => {
          pintarEstrelas(Number(estrela.dataset.valor));
        });
      });
  
      containerEstrelas.addEventListener("mouseleave", () => {
        pintarEstrelas(Number(containerEstrelas.dataset.nota || 0));
      });
    }
  
    /* -------------------- Estado de carregamento -------------------- */
  
    function iniciarCarregamento() {
      if (!botaoEnviar) return;
      botaoEnviar.disabled = true;
      botaoEnviar.classList.add("btn--carregando");
      if (textoBotao) textoBotao.textContent = "Enviando...";
    }
  
    function pararCarregamento() {
      if (!botaoEnviar) return;
      botaoEnviar.disabled = false;
      botaoEnviar.classList.remove("btn--carregando");
      if (textoBotao) textoBotao.textContent = "Adicionar resenha";
    }
  
    /* -------------------- Feedback -------------------- */
  
    function mostrarFeedback(mensagem, tipo) {
      const container = document.getElementById("feedback-container");
      if (!container) return;
  
      container.innerHTML = `<div class="feedback__item feedback__item--${tipo}">${mensagem}</div>`;
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  
    /* -------------------- Submit -------------------- */
  
    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();
  
      const nota = Number(inputNota.value);
      const comentario = campoComentario.value.trim();
  
      if (erroComentario) erroComentario.textContent = "";
  
      if (!nota || nota < 1 || nota > 5) {
        mostrarFeedback("Escolha uma nota de 1 a 5 estrelas.", "erro");
        return;
      }
  
      if (!comentario) {
        if (erroComentario) erroComentario.textContent = "Escreva um comentário.";
        campoComentario.focus();
        return;
      }
  
      iniciarCarregamento();
  
      try {
        const resposta = await fetch(`/avaliacoes/filme/${encodeURIComponent(filmeId)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nota, comentario }),
        });
  
        const dados = await resposta.json();
  
        if (!resposta.ok) {
          mostrarFeedback(dados.mensagem || "Não foi possível enviar sua avaliação.", "erro");
          return;
        }
  
        mostrarFeedback("Avaliação enviada com sucesso!", "sucesso");
        form.reset();
        inputNota.value = "0";
        if (containerEstrelas) {
          containerEstrelas.dataset.nota = "0";
          pintarEstrelas(0);
        }
  
        adicionarResenhaNaLista(dados);
      } catch (erro) {
        console.error("Erro ao enviar avaliação:", erro);
        mostrarFeedback("Não foi possível conectar ao servidor. Tente novamente.", "erro");
      } finally {
        pararCarregamento();
      }
    });
  
    /* -------------------- Atualiza a lista sem recarregar -------------------- */
  
    function adicionarResenhaNaLista(avaliacao) {
      const lista = document.getElementById("lista-opinioes");
      if (!lista) return;
  
      const vazio = lista.querySelector(".genero__vazio");
      if (vazio) vazio.remove();
  
      const artigo = document.createElement("article");
      artigo.className = "opiniao";
      artigo.dataset.opiniaoId = avaliacao.id;
      artigo.innerHTML = `
        <div class="opiniao__cabecalho">
          <span class="opiniao__autor">${avaliacao.usuarioNome || "Você"}</span>
          <span class="estrelas">\u2605 ${avaliacao.nota}</span>
        </div>
        <p class="opiniao__texto"></p>
      `;
      artigo.querySelector(".opiniao__texto").textContent = avaliacao.comentario;
  
      lista.prepend(artigo);
    }
  })();
  