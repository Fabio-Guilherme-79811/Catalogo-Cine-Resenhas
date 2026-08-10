/**
 * Pré-visualização da capa do filme (admin-filme-form.ejs).
 *
 * Assim que o admin escolhe uma imagem no input de arquivo, mostra a
 * prévia na hora (via FileReader, sem precisar enviar nada pro servidor
 * ainda — o upload de fato só acontece quando o formulário é enviado).
 */
(function () {
    const input = document.getElementById("input-capa");
    const area = document.getElementById("upload-capa-area");
    const preview = document.getElementById("upload-capa-preview");
  
    if (!input || !area || !preview) return;
  
    const TAMANHO_MAXIMO_MB = 5;
    const TIPOS_ACEITOS = ["image/png", "image/jpeg"];
  
    function limparErro() {
      const erroExistente = area.parentElement.querySelector(".upload-capa__erro");
      if (erroExistente) erroExistente.remove();
    }
  
    function mostrarErro(mensagem) {
      limparErro();
      const span = document.createElement("span");
      span.className = "form__erro upload-capa__erro";
      span.textContent = mensagem;
      area.parentElement.appendChild(span);
    }
  
    input.addEventListener("change", () => {
      limparErro();
  
      const arquivo = input.files && input.files[0];
      if (!arquivo) return;
  
      if (!TIPOS_ACEITOS.includes(arquivo.type)) {
        mostrarErro("Envie uma imagem PNG ou JPEG.");
        input.value = "";
        return;
      }
  
      if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
        mostrarErro(`A imagem deve ter no máximo ${TAMANHO_MAXIMO_MB}MB.`);
        input.value = "";
        return;
      }
  
      const leitor = new FileReader();
  
      leitor.onload = () => {
        preview.src = leitor.result;
        area.classList.add("tem-imagem");
      };
  
      leitor.onerror = () => {
        mostrarErro("Não foi possível ler essa imagem. Tente outra.");
      };
  
      leitor.readAsDataURL(arquivo);
    });
  
    // Clicar no botão "Remover título" também limpa a pré-visualização
    const botaoRemover = document.getElementById("btn-remover-titulo");
    if (botaoRemover) {
      botaoRemover.addEventListener("click", () => {
        input.value = "";
        preview.src = "";
        area.classList.remove("tem-imagem");
        limparErro();
      });
    }
  })();
  