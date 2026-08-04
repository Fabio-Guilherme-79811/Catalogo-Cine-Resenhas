const form = document.getElementById("form-avaliacao");


if (form) {

    form.addEventListener("submit", async (event) => {

        event.preventDefault();


        const nota = document.getElementById("nota").value;
        const comentario = document.getElementById("comentario").value;


        const resposta = await fetch("/avaliacoes/filme/1", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nota,
                comentario
            })

        });


        const dados = await resposta.json();


        const feedback = document.getElementById("feedback");

        feedback.textContent = dados.mensagem ?? "Avaliação enviada!";

    });

}