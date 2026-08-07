/**
 * Botão "Favoritar" (detalhes.ejs).
 *
 * Alterna o filme entre favoritado/não favoritado via fetch, sem recarregar
 * a página. Se o usuário não estiver autenticado, a API responde com um
 * redirect para /login (ver `isAuthenticated` em `auth-middleware.ts`);
 * nesse caso o próprio navegador é redirecionado para lá.
 */
(function () {
  const botao = document.getElementById("btn-favoritar");
  if (!botao) return;

  const filmeId = botao.dataset.filmeId;

  function atualizarTexto(favoritado) {
    botao.dataset.favoritado = String(favoritado);
    botao.textContent = favoritado ? "\u2605 Favoritado" : "\u2606 Favoritar";
    botao.classList.toggle("btn-favoritar--ativo", favoritado);
  }

  botao.addEventListener("click", async () => {
    const favoritadoAtualmente = botao.dataset.favoritado === "true";
    const metodo = favoritadoAtualmente ? "DELETE" : "POST";

    botao.disabled = true;

    try {
      const resposta = await fetch(`/favoritos/filme/${encodeURIComponent(filmeId)}`, {
        method: metodo,
      });

      // Sem sessão válida: isAuthenticated redireciona para /login (resposta
      // HTML da própria página de login, não JSON) — manda o usuário para lá.
      if (resposta.redirected) {
        window.location.href = resposta.url;
        return;
      }

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        window.alert(dados.mensagem || "Não foi possível atualizar seus favoritos.");
        return;
      }

      atualizarTexto(Boolean(dados.favoritado));
    } catch (erro) {
      console.error("Erro ao favoritar/desfavoritar filme:", erro);
      window.alert("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      botao.disabled = false;
    }
  });
})();
