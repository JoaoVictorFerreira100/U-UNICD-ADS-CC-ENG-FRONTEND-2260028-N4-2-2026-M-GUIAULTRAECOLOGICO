const botaoLeitura = document.querySelector("#botao-leitura");
const chaveLeituraAtiva = "guia-ultra-ecologico-leitura-ativa";

if (botaoLeitura instanceof HTMLButtonElement) {
    const sintetizador = window.speechSynthesis;

    if (!sintetizador) {
        botaoLeitura.disabled = true;
        botaoLeitura.title = "A narração em voz alta não está disponível neste navegador.";
    } else {
        let ultimaFalaDeAjuda = 0;
        let ultimoToque = 0;
        let ultimoUsoDeTab = 0;
        let textoEmLeitura = "";
        let indiceEmLeitura = 0;
        let falaDaPagina = null;

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

        const iniciarLeitura = (texto = obterTextoDaPagina()) => {
            if (!texto || !leituraEstaAtiva()) {
                return;
            }

            textoEmLeitura = texto;
            indiceEmLeitura = 0;
            const fala = new SpeechSynthesisUtterance(texto);
            fala.lang = "pt-BR";
            fala.addEventListener("boundary", (evento) => {
                if (falaDaPagina === fala) {
                    indiceEmLeitura = Math.min(
                        texto.length,
                        evento.charIndex + (evento.charLength || 0)
                    );
                }
            });
            fala.addEventListener("end", () => {
                if (falaDaPagina === fala) {
                    falaDaPagina = null;
                    textoEmLeitura = "";
                    indiceEmLeitura = 0;
                }
            });
            falaDaPagina = fala;
            sintetizador.speak(fala);
        };

        const pararLeitura = () => {
            textoEmLeitura = "";
            indiceEmLeitura = 0;
            falaDaPagina = null;
            sintetizador.cancel();
        };

        const anunciarLegenda = (forcar = false, iniciarAposAnuncio = false) => {
            const agora = Date.now();
            if (!forcar && agora - ultimaFalaDeAjuda < 1000) {
                return;
            }

            ultimaFalaDeAjuda = agora;
            const retomarTexto = falaDaPagina && leituraEstaAtiva()
                ? textoEmLeitura.slice(indiceEmLeitura)
                : "";
            if (falaDaPagina) {
                falaDaPagina = null;
                sintetizador.cancel();
            }

            const fala = new SpeechSynthesisUtterance("Narração");
            fala.lang = "pt-BR";
            fala.addEventListener("end", () => {
                if (retomarTexto && leituraEstaAtiva()) {
                    iniciarLeitura(retomarTexto);
                } else if (iniciarAposAnuncio && leituraEstaAtiva()) {
                    iniciarLeitura();
                }
            }, { once: true });
            sintetizador.speak(fala);
        };

        botaoLeitura.addEventListener("pointerdown", (evento) => {
            if (evento.pointerType === "touch") {
                ultimoToque = Date.now();
            }
        });

        botaoLeitura.addEventListener("click", () => {
            const ativar = !leituraEstaAtiva();
            localStorage.setItem(chaveLeituraAtiva, String(ativar));
            atualizarBotao();

            const toqueRecente = Date.now() - ultimoToque < 1000;
            if (toqueRecente) {
                if (ativar) {
                    anunciarLegenda(true, true);
                } else {
                    pararLeitura();
                    anunciarLegenda(true);
                }
            } else if (ativar) {
                iniciarLeitura();
            } else {
                pararLeitura();
            }
        });

        botaoLeitura.addEventListener("pointerenter", (evento) => {
            if (evento.pointerType !== "touch") {
                anunciarLegenda();
            }
        });
        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Tab") {
                ultimoUsoDeTab = Date.now();
            }
        });
        botaoLeitura.addEventListener("focus", () => {
            if (
                Date.now() - ultimoToque >= 1000 &&
                Date.now() - ultimoUsoDeTab < 1000
            ) {
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

        window.addEventListener("pagehide", pararLeitura);

        atualizarBotao();
        if (leituraEstaAtiva()) {
            iniciarLeitura();
        }
    }
}
