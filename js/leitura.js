const botaoLeitura = document.querySelector("#botao-leitura");
const chaveLeituraAtiva = "guia-ultra-ecologico-leitura-ativa";

if (botaoLeitura instanceof HTMLButtonElement) {
    const sintetizador = window.speechSynthesis;

    if (!sintetizador) {
        botaoLeitura.disabled = true;
        botaoLeitura.title = "A leitura em voz alta não está disponível neste navegador.";
    } else {
        const leituraEstaAtiva = () =>
            localStorage.getItem(chaveLeituraAtiva) === "true";

        const atualizarBotao = () => {
            const ativo = leituraEstaAtiva();
            botaoLeitura.textContent = ativo ? "ON" : "OFF";
            botaoLeitura.setAttribute("aria-pressed", String(ativo));
            botaoLeitura.setAttribute(
                "aria-label",
                `Leitura ${ativo ? "ativada" : "desativada"}`
            );
        };

        const obterTextoDaPagina = () =>
            Array.from(document.body.children)
                .filter((elemento) => elemento.id !== "controle-leitura")
                .map((elemento) => elemento.innerText)
                .filter(Boolean)
                .join(". ");

        const falarTexto = (texto) => {
            const fala = new SpeechSynthesisUtterance(texto);
            fala.lang = "pt-BR";
            sintetizador.speak(fala);
        };

        const iniciarLeitura = () => {
            const texto = obterTextoDaPagina();
            if (texto) {
                sintetizador.cancel();
                falarTexto(texto);
            }
        };

        botaoLeitura.addEventListener("click", () => {
            const ativar = !leituraEstaAtiva();
            localStorage.setItem(chaveLeituraAtiva, String(ativar));
            atualizarBotao();

            if (ativar) {
                iniciarLeitura();
            } else {
                sintetizador.cancel();
            }
        });

        let ultimaFalaDeAjuda = 0;
        const falarLegenda = () => {
            const agora = Date.now();
            if (agora - ultimaFalaDeAjuda < 1000) {
                return;
            }

            ultimaFalaDeAjuda = agora;
            falarTexto("leitura");
        };

        botaoLeitura.addEventListener("pointerenter", falarLegenda);
        botaoLeitura.addEventListener("focus", falarLegenda);

        document.addEventListener("click", (evento) => {
            if (!(evento.target instanceof Element)) {
                return;
            }

            const link = evento.target.closest("a[href]");
            if (link) {
                sintetizador.cancel();
            }
        });

        window.addEventListener("pagehide", () => sintetizador.cancel());

        atualizarBotao();
        if (leituraEstaAtiva()) {
            iniciarLeitura();
        }
    }
}
