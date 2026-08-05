/**
 * Ações do painel administrativo (admin-dashboard.ejs).
 *
 * Por enquanto cuida da exclusão de filmes na tabela: confirma com o
 * admin, chama a API via fetch (com o botão mostrando estado de
 * carregamento) e remove a linha da tabela sem recarregar a página.
 */
(function () {
    const tabela = document.getElementById("tabela-filmes-corpo");
    if (!tabela) return;
  
    tabela.addEventListener("click", async (evento) => {
      const botao = evento.target.closest(".btn-excluir-filme");
      if (!botao) return;
  
      const filmeId = botao.dataset.id;
      const linha = botao.closest("tr");
      const titulo = linha ? linha.querySelector("td")?.textContent : "este filme";
  
      const confirmou = window.confirm(`Remover "${titulo}" do catálogo? Essa ação não pode ser desfeita.`);
      if (!confirmou) return;
  
      const textoOriginal = botao.textContent;
      botao.disabled = true;
      botao.textContent = "Excluindo...";
  
      try {
        const resposta = await fetch(`/conteudo/filmes/${encodeURIComponent(filmeId)}`, {
          method: "DELETE",
        });
  
        const dados = await resposta.json().catch(() => ({}));
  
        if (!resposta.ok) {
          window.alert(dados.mensagem || "Não foi possível excluir o filme.");
          botao.disabled = false;
          botao.textContent = textoOriginal;
          return;
        }
  
        if (linha) {
          linha.remove();
          atualizarEstadoVazio();
        }
      } catch (erro) {
        console.error("Erro ao excluir filme:", erro);
        window.alert("Não foi possível conectar ao servidor. Tente novamente.");
        botao.disabled = false;
        botao.textContent = textoOriginal;
      }
    });
  
    function atualizarEstadoVazio() {
      if (tabela.querySelector("tr")) return;
  
      const linhaVazia = document.createElement("tr");
      linhaVazia.innerHTML = '<td colspan="5">Nenhum filme cadastrado ainda.</td>';
      tabela.appendChild(linhaVazia);
    }
  })();
  