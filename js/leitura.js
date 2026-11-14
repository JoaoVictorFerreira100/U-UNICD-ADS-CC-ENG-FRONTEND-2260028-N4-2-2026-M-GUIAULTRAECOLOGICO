const botaoLeitura = document.querySelector("#botao-leitura");
const chaveLeituraAtiva = "guia-ultra-ecologico-leitura-ativa";

if (botaoLeitura instanceof HTMLButtonElement) {
    const sintetizador = window.speechSynthesis;

    if (!sintetizador) {
        botaoLeitura.disabled = true;
        botaoLeitura.title = "A narração em voz alta não está disponível neste navegador.";
    } else {
        const leituraEstaAtiva = () =>
            localStorage.getItem(chaveLeituraAtiva) === "true";

        const atualizarBotao = () => {
            const ativo = leituraEstaAtiva();
            botaoLeitura.textContent = ativo ? "ON" : "OFF";
            botaoLeitura.setAttribute("aria-pressed", String(ativo));
            botaoLeitura.setAttribute(
                "aria-label",
                `Narração ${ativo ? "ativada" : "desativada"}`
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

        let ultimoToque = 0;
        botaoLeitura.addEventListener("pointerdown", (evento) => {
            if (evento.pointerType === "touch") {
                ultimoToque = Date.now();
            }
        });

        const anunciarLegenda = (continuarLeitura = false, forcar = false) => {
            const agora = Date.now();
            if (!forcar && agora - ultimaFalaDeAjuda < 1000) {
                return;
            }

            ultimaFalaDeAjuda = agora;
            const fala = new SpeechSynthesisUtterance("Narração");
            fala.lang = "pt-BR";
            if (continuarLeitura) {
                fala.addEventListener("end", () => {
                    if (leituraEstaAtiva()) {
                        iniciarLeitura();
                    }
                }, { once: true });
            }
            sintetizador.cancel();
            sintetizador.speak(fala);
        };

        botaoLeitura.addEventListener("click", () => {
            const ativar = !leituraEstaAtiva();
            localStorage.setItem(chaveLeituraAtiva, String(ativar));
            atualizarBotao();

            const toqueRecente = Date.now() - ultimoToque < 1000;
            if (toqueRecente) {
                anunciarLegenda(ativar, true);
            } else if (ativar) {
                iniciarLeitura();
            } else {
                sintetizador.cancel();
            }
        });

        let ultimaFalaDeAjuda = 0;
        botaoLeitura.addEventListener("pointerenter", (evento) => {
            if (evento.pointerType !== "touch") {
                anunciarLegenda();
            }
        });
        botaoLeitura.addEventListener("focus", () => {
            if (Date.now() - ultimoToque >= 1000) {
                anunciarLegenda();
            }
        });

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
