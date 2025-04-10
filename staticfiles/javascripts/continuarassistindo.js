document.addEventListener("DOMContentLoaded", function () {
    const carrosselContainer = document.querySelector(".continue-assistindo-carrosel-container");
    const carrossel = document.querySelector(".continue-assistindo-carrosel");

    // Função para verificar se há progresso no localStorage
    function verificarProgresso() {
        const progresso = [];
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            if (chave.startsWith("progress_")) {
                const item = JSON.parse(localStorage.getItem(chave));
                progresso.push(item);
            }
        }
        return progresso;
    }

    // Função para preencher o carrossel com os itens do localStorage
    function preencherCarrossel(progresso) {
        carrossel.innerHTML = ""; // Limpa o carrossel

        progresso.forEach((item) => {
            const carrosselItem = document.createElement("div");
            carrosselItem.classList.add("continue-assistindo-carrosel-item");

            carrosselItem.innerHTML = `
                <a href="#">
                    <div class="continue-assistindo-item-container">
                        <img src="${item.imagem}" alt="${item.titulo}" class="continue-assistindo-item-imagem">
                        <button class="play-button">▶</button>
                    </div>
                    <div class="continue-assistindo-item-info">
                        <h4 class="continue-assistindo-item-titulo">${item.titulo}</h4>
                        <div class="continue-assistindo-item-tempo">
                            <span class="tempo">${formatarTempo(item.tempo)}</span>
                            <div class="linha-vermelha"></div>
                        </div>
                    </div>
                </a>
            `;

            carrossel.appendChild(carrosselItem);
        });
    }

    // Função para formatar o tempo (ex: 75 segundos -> 1:15)
    function formatarTempo(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = Math.floor(segundos % 60);
        return `${minutos}:${segundosRestantes.toString().padStart(2, "0")}`;
    }

    // Verifica se há progresso no localStorage
    const progresso = verificarProgresso();
    if (progresso.length > 0) {
        // Exibe o carrossel e preenche com os itens
        carrosselContainer.style.display = "block";
        preencherCarrossel(progresso);
    } else {
        // Mantém o carrossel oculto
        carrosselContainer.style.display = "none";
    }
});