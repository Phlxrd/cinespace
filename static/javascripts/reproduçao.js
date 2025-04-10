document.addEventListener("DOMContentLoaded", function () {
    // Seleciona elementos do DOM
    const modal = document.getElementById("videoModal");
    const videoPlayer = document.getElementById("videoPlayer");
    const movieTitle = document.getElementById("movieTitle");
    const closeButton = document.querySelector(".close");
    const episodeCarousel = document.querySelectorAll(".carousel-item.carrossel-episodios");
    const assistirBtn = document.getElementById("assistirBtn");
    const nextEpisodeButton = document.getElementById("nextEpisodeButton");
    const prevEpisodeButton = document.getElementById("prevEpisodeButton");

    // Variáveis globais
    let currentPerfilId = localStorage.getItem("selectedProfileId"); // ID do perfil ativo
    let currentMidiaId = 1; // ID da mídia (filme ou episódio)
    let currentEpisodioNumero = 1; // Número do episódio
    let currentEpisodeIndex = 0; // Índice do episódio atual

    // Lista de episódios
    const episodes = [
        { title: "The Last of Us - Episódio 1", src: "http://127.0.0.1:5500/thelastofus-ep1.mp4" },
        { title: "The Last of Us - Episódio 2", src: "http://127.0.0.1:5500/thelastofus-ep2.mp4" },
        { title: "The Last of Us - Episódio 3", src: "http://127.0.0.1:5500/thelastofus-ep3.mp4" }
    ];

    // Função para salvar o progresso no localStorage
    function saveProgress(perfilId, midiaId, episodioNumero, currentTime, titulo, imagem) {
        const progressKey = `progress_${perfilId}_${midiaId}_${episodioNumero}`;
        const progresso = {
            perfilId: perfilId,
            midiaId: midiaId,
            episodioNumero: episodioNumero,
            tempo: currentTime,
            titulo: titulo,
            imagem: imagem
        };
        localStorage.setItem(progressKey, JSON.stringify(progresso));
        console.log(`Progresso salvo para o perfil ${perfilId}: ${progressKey} = ${currentTime}`);
    }

    // Função para recuperar o progresso do localStorage
    function getProgress(perfilId, midiaId, episodioNumero) {
        const progressKey = `progress_${perfilId}_${midiaId}_${episodioNumero}`;
        const savedTime = localStorage.getItem(progressKey);
        if (savedTime) {
            videoPlayer.currentTime = parseFloat(savedTime);
            console.log(`Progresso recuperado para o perfil ${perfilId}: ${progressKey} = ${savedTime}`);
        } else {
            videoPlayer.currentTime = 0;
            console.log(`Nenhum progresso encontrado para o perfil ${perfilId}: ${progressKey}`);
        }
    }

    // Abre o modal e inicia o vídeo ao clicar no botão "Assistir"
    assistirBtn.addEventListener("click", function () {
        modal.style.display = "flex";
        document.querySelector("header").style.display = "none"; // Oculta o header

        // Recupera o progresso antes de iniciar a reprodução
        getProgress(currentPerfilId, currentMidiaId, currentEpisodioNumero);

        // Inicia a reprodução do vídeo
        videoPlayer.play();
    });

    // Fecha o modal e pausa o vídeo ao clicar no botão de fechar
    closeButton.addEventListener("click", function () {
        modal.style.display = "none";
        videoPlayer.pause();
        document.querySelector("header").style.display = "flex"; // Mostra o header

        // Captura e salva os dados do filme/série
        const titulo = movieTitle.textContent; // Título do filme/série
        const imagem = videoPlayer.poster || ""; // URL da imagem do filme/série (se disponível)
        saveProgress(currentPerfilId, currentMidiaId, currentEpisodioNumero, videoPlayer.currentTime, titulo, imagem);
    });

    // Fecha o modal se clicar fora do conteúdo
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
            videoPlayer.pause();
            document.querySelector("header").style.display = "flex"; // Mostra o header

            // Captura e salva os dados do filme/série
            const titulo = movieTitle.textContent; // Título do filme/série
            const imagem = videoPlayer.poster || ""; // URL da imagem do filme/série (se disponível)
            saveProgress(currentPerfilId, currentMidiaId, currentEpisodioNumero, videoPlayer.currentTime, titulo, imagem);
        }
    });

    // Abre o modal ao clicar em um episódio no carrossel
    episodeCarousel.forEach((episode) => {
        episode.addEventListener("click", function () {
            const episodeSrc = this.getAttribute("data-src");
            const episodeTitle = this.getAttribute("data-title");
            const episodeId = this.getAttribute("data-id");

            // Atualiza as variáveis globais
            currentMidiaId = episodeId; // ID da mídia (filme ou episódio)
            currentEpisodioNumero = episodeId; // Número do episódio (ou 0 para filmes)

            // Atualiza o vídeo e o título no modal
            videoPlayer.src = episodeSrc;
            movieTitle.textContent = episodeTitle;

            // Abre o modal
            modal.style.display = "flex";
            document.querySelector("header").style.display = "none"; // Oculta o header

            // Recupera o progresso antes de iniciar a reprodução
            getProgress(currentPerfilId, currentMidiaId, currentEpisodioNumero);

            // Inicia a reprodução do vídeo
            videoPlayer.play();
        });
    });

    // Salva o progresso quando o vídeo é pausado
    videoPlayer.addEventListener('pause', () => {
        console.log("Vídeo pausado. Salvando progresso..."); // Log para depuração

        // Captura e salva os dados do filme/série
        const titulo = movieTitle.textContent; // Título do filme/série
        const imagem = videoPlayer.poster || ""; // URL da imagem do filme/série (se disponível)
        saveProgress(currentPerfilId, currentMidiaId, currentEpisodioNumero, videoPlayer.currentTime, titulo, imagem);
    });

    // Navegação entre episódios
    nextEpisodeButton.addEventListener("click", loadNextEpisode);
    prevEpisodeButton.addEventListener("click", loadPreviousEpisode);

    function loadNextEpisode() {
        if (currentEpisodeIndex < episodes.length - 1) {
            currentEpisodeIndex++;
            updateEpisode();
        } else {
            alert("Este é o último episódio.");
        }
    }

    function loadPreviousEpisode() {
        if (currentEpisodeIndex > 0) {
            currentEpisodeIndex--;
            updateEpisode();
        } else {
            alert("Este é o primeiro episódio.");
        }
    }

    function updateEpisode() {
        // Salva o progresso do episódio atual antes de mudar
        const titulo = movieTitle.textContent; // Título do episódio atual
        const imagem = videoPlayer.poster || ""; // URL da imagem do episódio atual
        saveProgress(currentPerfilId, currentMidiaId, currentEpisodioNumero, videoPlayer.currentTime, titulo, imagem);

        // Atualiza o vídeo e o título do episódio
        videoPlayer.src = episodes[currentEpisodeIndex].src;
        movieTitle.textContent = episodes[currentEpisodeIndex].title;

        // Recupera o progresso do novo episódio
        getProgress(currentPerfilId, currentMidiaId, currentEpisodioNumero);

        // Inicia a reprodução do vídeo
        videoPlayer.play();

        // Atualiza a visibilidade dos botões de navegação
        updateEpisodeButtonsVisibility();
    }

    function updateEpisodeButtonsVisibility() {
        prevEpisodeButton.style.display = currentEpisodeIndex > 0 ? "block" : "none";
        nextEpisodeButton.style.display = currentEpisodeIndex < episodes.length - 1 ? "block" : "none";
    }

    // Inicializa a visibilidade dos botões de navegação
    updateEpisodeButtonsVisibility();
});