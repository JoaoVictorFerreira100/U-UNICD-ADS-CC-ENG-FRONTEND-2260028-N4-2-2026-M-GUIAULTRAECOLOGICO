const formularioNome = document.querySelector("#formulario-nome");

if (formularioNome instanceof HTMLFormElement) {
    const chaveRascunho = "guia-ultra-ecologico-rascunho";
    const campoNome = formularioNome.querySelector("#nome");
    const mensagemNome = formularioNome.querySelector("#mensagem-nome");
    const campoEmail = formularioNome.querySelector("#email");
    const mensagemEmail = formularioNome.querySelector("#mensagem-email");
    const statusArmazenamento = formularioNome.querySelector("#status-armazenamento");

    if (
        campoNome instanceof HTMLInputElement &&
        mensagemNome instanceof HTMLParagraphElement &&
        campoEmail instanceof HTMLInputElement &&
        mensagemEmail instanceof HTMLParagraphElement &&
        statusArmazenamento instanceof HTMLParagraphElement
    ) {
        const informarFalhaArmazenamento = (acao) => {
            statusArmazenamento.className = "status-erro";
            statusArmazenamento.textContent = `Não foi possível ${acao} no armazenamento local deste navegador.`;
        };

        try {
            const rascunhoSalvo = localStorage.getItem(chaveRascunho);
            if (rascunhoSalvo) {
                const rascunho = JSON.parse(rascunhoSalvo);
                if (
                    typeof rascunho.nome === "string" &&
                    typeof rascunho.email === "string"
                ) {
                    campoNome.value = rascunho.nome;
                    campoEmail.value = rascunho.email;
                    statusArmazenamento.textContent = "Rascunho recuperado.";
                } else {
                    informarFalhaArmazenamento("recuperar os dados");
                }
            }
        } catch {
            informarFalhaArmazenamento("recuperar os dados");
        }

        const salvarRascunho = () => {
            try {
                const rascunho = {
                    nome: campoNome.value,
                    email: campoEmail.value
                };
                if (!rascunho.nome && !rascunho.email) {
                    localStorage.removeItem(chaveRascunho);
                    statusArmazenamento.textContent = "";
                } else {
                    localStorage.setItem(chaveRascunho, JSON.stringify(rascunho));
                    statusArmazenamento.className = "";
                    statusArmazenamento.textContent = "Rascunho salvo.";
                }
            } catch {
                informarFalhaArmazenamento("salvar os dados");
            }
        };

        formularioNome.addEventListener("submit", (evento) => {
            evento.preventDefault();
            const nome = campoNome.value.trim();
            const email = campoEmail.value.trim();
            const nomeValido = Boolean(nome);
            const emailValido = Boolean(email) && campoEmail.validity.valid;

            if (!nomeValido) {
                campoNome.classList.add("campo-erro");
                campoNome.setAttribute("aria-invalid", "true");
                mensagemNome.className = "mensagem-erro";
                mensagemNome.textContent = "Por favor, informe seu nome.";
            } else {
                campoNome.classList.remove("campo-erro");
                campoNome.setAttribute("aria-invalid", "false");
                mensagemNome.className = "";
                mensagemNome.textContent = "";
            }

            if (!email) {
                campoEmail.classList.add("campo-erro");
                campoEmail.setAttribute("aria-invalid", "true");
                mensagemEmail.className = "mensagem-erro";
                mensagemEmail.textContent = "Por favor, informe seu e-mail.";
            } else if (!emailValido) {
                campoEmail.classList.add("campo-erro");
                campoEmail.setAttribute("aria-invalid", "true");
                mensagemEmail.className = "mensagem-erro";
                mensagemEmail.textContent = "Informe um e-mail válido.";
            } else {
                campoEmail.classList.remove("campo-erro");
                campoEmail.setAttribute("aria-invalid", "false");
                mensagemEmail.className = "";
                mensagemEmail.textContent = "";
            }

            if (!nomeValido) {
                campoNome.focus();
            } else if (!emailValido) {
                campoEmail.focus();
            } else {
                mensagemNome.className = "mensagem-sucesso";
                mensagemNome.textContent = `Dados validados para ${nome}.`;
            }
        });

        const limparErroSeValido = (campo, mensagem, valorValido) => {
            campo.addEventListener("input", () => {
                salvarRascunho();
                if (valorValido()) {
                    campo.classList.remove("campo-erro");
                    campo.setAttribute("aria-invalid", "false");
                    mensagem.textContent = "";
                    mensagem.className = "";
                }
            });
        };

        limparErroSeValido(campoNome, mensagemNome, () => Boolean(campoNome.value.trim()));
        limparErroSeValido(
            campoEmail,
            mensagemEmail,
            () => Boolean(campoEmail.value.trim()) && campoEmail.validity.valid
        );
    }
}
