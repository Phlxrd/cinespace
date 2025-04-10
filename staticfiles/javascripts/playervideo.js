

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("videoModal");
    const playButton = document.getElementById("playButton");
    const videoPlayer = document.getElementById("videoPlayer");
    const closeButton = document.querySelector(".close");
    const playPauseButton = document.getElementById("playPauseButton");
    const playPauseIcon = document.getElementById("playPauseIcon");
    const rewindButton = document.getElementById("rewindButton");
    const forwardButton = document.getElementById("forwardButton");
    const progressBar = document.getElementById("progressBar");
    const progressBall = document.getElementById("progressBall");
    const videoTime = document.getElementById("videoTime");
    const fullscreenButton = document.getElementById("fullscreenButton");
    const volumeButton = document.getElementById("volumeButton");
    const volumeIcon = document.getElementById("volumeIcon");
    const volumeSlider = document.getElementById("volumeSlider");
    const speedButton = document.getElementById("speedButton");
    const speedMenu = document.getElementById("speedMenu");
    const subtitlesButton = document.getElementById("subtitlesButton");
    const videoPlayPauseOverlay = document.getElementById("videoPlayPauseOverlay");
    const videoPlayPauseIcon = document.getElementById("videoPlayPauseIcon");
    const rewindFeedback = document.getElementById("rewindFeedback");
    const forwardFeedback = document.getElementById("forwardFeedback");
    // Elementos do preview
    const videoPreview = document.getElementById("videoPreview");
    const previewImage = document.getElementById("previewImage");
    const previewTime = document.getElementById("previewTime");

    // Desabilita os controles padrão do vídeo
    videoPlayer.controls = false;

    // Verifica se o vídeo está pronto para ser manipulado
    let isVideoReady = false;

    videoPlayer.addEventListener("loadedmetadata", function () {
        isVideoReady = true; // O vídeo está pronto para ser manipulado
    });


    // Função para mostrar o ícone e escondê-lo após 0.6 segundos
    function showIcon(iconSrc) {
        videoPlayPauseIcon.src = iconSrc; // Define o ícone no centro da tela
        videoPlayPauseOverlay.style.opacity = 1; // Mostra o ícone

        // Esconde o ícone após 0.6 segundos
        setTimeout(() => {
            videoPlayPauseOverlay.style.opacity = 0;
        }, 600); // 0.6 segundos
    }

    // Pausar/despausar ao clicar na tela do vídeo
    videoPlayer.addEventListener("click", function () {
        if (videoPlayer.paused) {
            videoPlayer.play(); // Inicia o vídeo
            showIcon("https://i.postimg.cc/4NcsyFXF/pausa.png"); // Mostra o ícone de pause no centro
            playPauseIcon.src = "https://i.postimg.cc/4NcsyFXF/pausa.png"; // Atualiza o ícone do player
        } else {
            videoPlayer.pause(); // Pausa o vídeo
            showIcon("https://i.postimg.cc/HkCHy4xW/play.png"); // Mostra o ícone de play no centro
            playPauseIcon.src = "https://i.postimg.cc/HkCHy4xW/play.png"; // Atualiza o ícone do player
        }
    });

    // Play/Pause ao clicar no botão do player
    playPauseButton.addEventListener("click", function () {
        if (videoPlayer.paused) {
            videoPlayer.play(); // Inicia o vídeo
            showIcon("https://i.postimg.cc/4NcsyFXF/pausa.png"); // Mostra o ícone de pause no centro
            playPauseIcon.src = "https://i.postimg.cc/4NcsyFXF/pausa.png"; // Atualiza o ícone do player
        } else {
            videoPlayer.pause(); // Pausa o vídeo
            showIcon("https://i.postimg.cc/HkCHy4xW/play.png"); // Mostra o ícone de play no centro
            playPauseIcon.src = "https://i.postimg.cc/HkCHy4xW/play.png"; // Atualiza o ícone do player
        }
    });

    // Retroceder 15 segundos
    rewindButton.addEventListener("click", function () {
        if (isVideoReady) {
            videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - 15);
        }
    });

    // Avançar 15 segundos
    forwardButton.addEventListener("click", function () {
        if (isVideoReady) {
            videoPlayer.currentTime = Math.min(videoPlayer.duration, videoPlayer.currentTime + 15);
        }
    });

    // Função para mostrar o ícone de feedback e escondê-lo após 0.6 segundos
    function showFeedbackIcon(iconElement) {
        iconElement.style.opacity = 1; // Mostra o ícone

        // Esconde o ícone após 0.6 segundos
        setTimeout(() => {
            iconElement.style.opacity = 0;
        }, 600); // 0.6 segundos
    }

    // Retroceder 15 segundos
    rewindButton.addEventListener("click", function () {
        if (isVideoReady) {
            videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - 15); // Retrocede 15 segundos
            showFeedbackIcon(rewindFeedback); // Mostra o ícone de feedback
        }
    });

    // Avançar 15 segundos
    forwardButton.addEventListener("click", function () {
        if (isVideoReady) {
            videoPlayer.currentTime = Math.min(videoPlayer.duration, videoPlayer.currentTime + 15); // Avança 15 segundos
            showFeedbackIcon(forwardFeedback); // Mostra o ícone de feedback
        }
    });

    // Atualizar barra de progresso e tempo do vídeo
    videoPlayer.addEventListener("timeupdate", function () {
        if (isVideoReady) {
            const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
            progressBar.style.width = progress + "%";
            progressBall.style.left = progress + "%";

            // Atualiza o tempo do vídeo
            const currentTime = formatTime(videoPlayer.currentTime);
            const duration = formatTime(videoPlayer.duration);
            videoTime.textContent = `${currentTime} / ${duration}`;
        }
    });
    // Função para formatar o tempo (horas:minutos:segundos)
    function formatTime(time) {
        const hours = Math.floor(time / 3600); // Calcula as horas
        const minutes = Math.floor((time % 3600) / 60); // Calcula os minutos
        const seconds = Math.floor(time % 60); // Calcula os segundos

        // Formata os valores para sempre ter dois dígitos
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Clique na barra de progresso para pular
    progressBar.parentElement.addEventListener("click", function (e) {
        if (isVideoReady) {
            const rect = progressBar.parentElement.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            videoPlayer.currentTime = clickPosition * videoPlayer.duration;
        }
    });

    // Tela cheia
    fullscreenButton.addEventListener("click", function () {
        if (!document.fullscreenElement) {
            modal.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // Controle de volume
    volumeButton.addEventListener("click", function () {
        if (videoPlayer.muted) {
            // Desmuta o vídeo e define o volume para 20% (ou o valor anterior)
            videoPlayer.muted = false;
            videoPlayer.volume = 0.2; // Define o volume para 20%
            volumeSlider.value = 0.2; // Atualiza o valor do slider
            volumeIcon.src = "https://i.postimg.cc/XNmnV06C/Volume.png";
        } else {
            // Muta o vídeo e zera a barra de volume
            videoPlayer.muted = true;
            videoPlayer.volume = 0; // Define o volume para 0
            volumeSlider.value = 0; // Atualiza o valor do slider
            volumeIcon.src = "https://i.postimg.cc/T3qxqLLV/mutado.png";
        }
        updateVolumeBar(); // Atualiza a barra de volume
    });

    // Atualizar o volume ao mover o slider
    volumeSlider.addEventListener("input", function () {
        videoPlayer.volume = volumeSlider.value; // Define o volume com base no slider
        if (videoPlayer.volume > 0) {
            videoPlayer.muted = false; // Desmuta se o volume for maior que 0
            volumeIcon.src = "https://i.postimg.cc/XNmnV06C/Volume.png";
        } else {
            videoPlayer.muted = true; // Muta se o volume for 0
            volumeIcon.src = "https://i.postimg.cc/T3qxqLLV/mutado.png";
        }
        updateVolumeBar(); // Atualiza a barra de volume
    });

    // Atualizar a barra de volume preenchida
    function updateVolumeBar() {
        const volumeSlider = document.getElementById("volumeSlider");
        const volumeSliderContainer = document.querySelector(".volume-slider-container");

        // Define a largura da barra preenchida com base no valor do volume
        const volumeWidth = (volumeSlider.value / volumeSlider.max) * 100;
        volumeSliderContainer.style.setProperty("--volume-width", `${volumeWidth}%`);
    }

    // Atualizar a barra de volume ao carregar a página
    updateVolumeBar();
    // Controle de velocidade
    speedButton.addEventListener("click", function () {
        speedMenu.style.display = speedMenu.style.display === "flex" ? "none" : "flex";
    });

    speedMenu.querySelectorAll("button").forEach(function (button) {
        button.addEventListener("click", function () {
            const speed = parseFloat(button.getAttribute("data-speed"));
            videoPlayer.playbackRate = speed;
            speedMenu.style.display = "none";
        });
    });

    // Legendas automáticas
    subtitlesButton.addEventListener("click", function () {
        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
            alert("Seu navegador não suporta reconhecimento de fala.");
            return;
        }

        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "pt-BR"; // Defina o idioma
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            alert("Legenda gerada: " + transcript); // Exibe a legenda (pode ser substituído por um overlay no vídeo)
        };

        recognition.onerror = function (event) {
            console.error("Erro no reconhecimento de fala:", event.error);
        };
    });
});
// Função para capturar o frame do vídeo em um determinado tempo
function captureFrame(time) {
    const canvas = document.createElement("canvas");
    const video = document.getElementById("videoPlayer");
    const context = canvas.getContext("2d");

    // Define o tamanho do canvas igual ao do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenha o frame no canvas
    video.currentTime = time;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Retorna a imagem capturada como URL
    return canvas.toDataURL();
}

// Mostrar o preview ao passar o mouse sobre a barra de progresso
const progressContainer = document.querySelector(".progress-container");
progressContainer.addEventListener("mousemove", function (e) {
    if (isVideoReady) {
        const rect = progressContainer.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const previewTimeValue = clickPosition * videoPlayer.duration;

        // Atualiza o tempo do preview
        previewTime.textContent = formatTime(previewTimeValue);

        // Captura e exibe o frame do vídeo
        previewImage.src = captureFrame(previewTimeValue);

        // Posiciona o preview
        videoPreview.style.left = `${e.clientX - rect.left}px`;
        videoPreview.style.display = "block";
    }
});

// Esconder o preview ao parar de passar o mouse sobre a barra de progresso
progressContainer.addEventListener("mouseleave", function () {
    videoPreview.style.display = "none";
});



document.addEventListener("DOMContentLoaded", function () {
    const categoryButtons = document.querySelectorAll('.category-button');
    const contentSections = document.querySelectorAll('.content-section');

    // Função para mostrar a seção selecionada e esconder as outras
    const showSection = (targetId) => {
        contentSections.forEach(section => {
            if (section.id === targetId) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    };

    // Função para ativar o botão selecionado e desativar os outros
    const activateButton = (button) => {
        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    };

    // Adiciona evento de clique aos botões de categoria
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target').substring(1);
            showSection(targetId);
            activateButton(button);
        });
    });

    // Mostra a seção de detalhes por padrão e ativa o botão de detalhes
    showSection('detalhes');
    document.querySelector('.category-button[data-target="#detalhes"]').classList.add('active');
});

document.addEventListener("DOMContentLoaded", function () {
    // Função para configurar o carrossel
    const setupCarousel = (carouselContainerClass, leftArrowClass, rightArrowClass, leftOverlayClass) => {
        const carouselContainer = document.querySelector(carouselContainerClass);
        const leftArrow = document.querySelector(leftArrowClass);
        const rightArrow = document.querySelector(rightArrowClass);
        const leftOverlay = document.querySelector(leftOverlayClass);
        const innerCarousel = carouselContainer.querySelector('.carousel');

        let isLeftVisible = false;

        leftArrow.style.display = 'none';
        leftOverlay.style.display = 'none';

        leftArrow.addEventListener('click', () => {
            innerCarousel.scrollBy({
                top: 0,
                left: -300, // Ajuste a quantidade de pixels conforme necessário
                behavior: 'smooth'
            });

            // Verifica se o carrossel está no início
            if (innerCarousel.scrollLeft <= 300) {
                isLeftVisible = false;
                leftArrow.style.display = 'none';
                leftOverlay.style.display = 'none';
            }
        });

        rightArrow.addEventListener('click', () => {
            innerCarousel.scrollBy({
                top: 0,
                left: 300, // Ajuste a quantidade de pixels conforme necessário
                behavior: 'smooth'
            });

            isLeftVisible = true;
            leftArrow.style.display = 'block';
            leftOverlay.style.display = 'block';
        });

        // Mostra a seta da direita ao passar o mouse sobre o carrossel
        carouselContainer.addEventListener('mouseenter', () => {
            rightArrow.style.display = 'block';
        });

        carouselContainer.addEventListener('mouseleave', () => {
            rightArrow.style.display = 'none';
        });
    };

    // Configura os carrosséis de elenco e episódios
    setupCarousel('.carousel-container-elenco', '.left-arrow-elenco', '.right-arrow-elenco', '.left-overlay-elenco');
    setupCarousel('.carousel-container-episodios', '.left-arrow-episodios', '.right-arrow-episodios', '.left-overlay-episodios');
});


document.addEventListener("DOMContentLoaded", function () {
    const videoPlayer = document.getElementById("videoPlayer");
    const playerControls = document.querySelector(".player-controls");
    const progressContainer = document.querySelector(".progress-container");
    const movieTitle = document.getElementById("movieTitle");
    const videoPlayPauseOverlay = document.getElementById("videoPlayPauseOverlay");

    let inactivityTimer;

    // Função para ocultar os controles e outros elementos
    function hideControls() {
        playerControls.style.opacity = "0";
        progressContainer.style.opacity = "0";
        movieTitle.style.opacity = "0";
    }

    // Função para mostrar os controles e outros elementos
    function showControls() {
        playerControls.style.opacity = "1";
        progressContainer.style.opacity = "1";
        movieTitle.style.opacity = "1";
    }

    // Reinicia o timer de inatividade
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer); // Limpa o timer anterior
        showControls(); // Mostra os controles ao detectar atividade
        inactivityTimer = setTimeout(hideControls, 5000); // Oculta os controles após 5 segundos de inatividade
    }

    // Monitora a atividade do mouse
    document.addEventListener("mousemove", resetInactivityTimer);
    document.addEventListener("mousedown", resetInactivityTimer);

    // Monitora a atividade do teclado
    document.addEventListener("keydown", resetInactivityTimer);

    // Monitora a interação com o vídeo (cliques no vídeo)
    videoPlayer.addEventListener("click", resetInactivityTimer);

    // Inicia o timer de inatividade ao carregar a página
    resetInactivityTimer();
});