document.addEventListener('DOMContentLoaded', function () {
    const videoElement = document.getElementById('trailerVideo');
    const indicators = document.querySelectorAll('.indicator.progress');

    // Configura o loop infinito para o vídeo
    videoElement.addEventListener('ended', function() {
        this.currentTime = 0; // Volta para o início
        this.play();         // Começa a reprodução novamente
    }, false);

    // Função para carregar e reproduzir o vídeo
    function loadAndPlayVideo(videoUrl) {
        videoElement.src = videoUrl;
        videoElement.load();
        videoElement.play();
    }

    // Função para atualizar o vídeo com base no indicador clicado
    function updateVideo(event) {
        const videoUrl = event.currentTarget.getAttribute('data-video');
        loadAndPlayVideo(videoUrl);

        // Remove a classe 'active' de todos os indicadores
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });

        // Adiciona a classe 'active' ao indicador clicado
        event.currentTarget.classList.add('active');
    }

    // Adiciona um event listener para cada indicador
    indicators.forEach(indicator => {
        indicator.addEventListener('click', updateVideo);
    });

    // Reproduz o primeiro vídeo automaticamente ao carregar a página
    if (indicators.length > 0) {
        const firstVideoUrl = indicators[0].getAttribute('data-video');
        loadAndPlayVideo(firstVideoUrl);

        // Adiciona a classe 'active' ao primeiro indicador
        indicators[0].classList.add('active');
    }

    // Garante que o vídeo continue tocando ao recarregar a página
    window.addEventListener('beforeunload', function () {
        videoElement.pause();
    });
});