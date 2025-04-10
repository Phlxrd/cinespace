// Seleciona elementos do DOM
const videoElement = document.getElementById('trailerVideo');
const indicators = document.querySelectorAll('.indicator');
const soundToggle = document.getElementById('sound-toggle'); // Seleciona o botão de som
const soundIcon = document.getElementById('sound-icon'); // Seleciona a imagem do ícone de som
const titleElement = document.querySelector('.movie-title-video'); // Seleciona o título do filme
const subtitleElement = document.querySelector('.movie-subtitle-video'); // Seleciona o subtítulo do filme
const yearElement = document.querySelector('.movie-year-video'); // Seleciona o ano do filme
const durationElement = document.querySelector('.movie-duration-video'); // Seleciona a duração do filme
const ageRatingElement = document.querySelector('.classificacao-idade-video'); // Seleciona a classificação de idade
const starsElements = document.querySelectorAll('.estrelas-video .star'); // Seleciona as estrelas de avaliação
const descriptionElement = document.querySelector('.movie-description-video p'); // Seleciona a descrição do filme
const genreButtons = document.querySelectorAll('.genre-btn-video'); // Seleciona os botões de gênero

// Função para atualizar as informações do filme
function updateMovieInfo(movieKey) {
    const movie = movieData[movieKey];
    titleElement.textContent = movie.title;
    subtitleElement.textContent = movie.subtitle;
    yearElement.textContent = movie.year;
    durationElement.textContent = movie.duration;
    ageRatingElement.src = movie.ageRating;
    descriptionElement.textContent = movie.description;

    // Atualiza as estrelas
    starsElements.forEach((star, index) => {
        star.style.display = index < movie.stars ? 'inline' : 'none';
    });

    // Atualiza os gêneros
    genreButtons.forEach((button, index) => {
        button.textContent = movie.genres[index] || '';
        button.style.display = movie.genres[index] ? 'inline-block' : 'none';
    });
}

// Função para iniciar o vídeo e atualizar as informações do filme
function startVideo(movieKey, videoSrc) {
    videoElement.src = videoSrc;
    videoElement.play(); // Inicia o vídeo automaticamente
    updateMovieInfo(movieKey);
}

// Adiciona evento de clique aos indicadores
indicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
        const videoSrc = indicator.getAttribute('data-video');
        const movieKey = indicator.getAttribute('data-movie');
        startVideo(movieKey, videoSrc);
    });
});

// Evento de clique para alternar som
soundToggle.addEventListener('click', () => {
    videoElement.muted = !videoElement.muted;
    soundIcon.src = videoElement.muted 
        ? soundToggle.getAttribute('data-sound-off') 
        : soundToggle.getAttribute('data-sound-on');
});

// Inicia o vídeo do "Venom" quando a página é carregada
window.addEventListener('load', () => {
    const firstIndicator = indicators[0];
    const firstVideoSrc = firstIndicator.getAttribute('data-video');
    const firstMovieKey = firstIndicator.getAttribute('data-movie');
    startVideo(firstMovieKey, firstVideoSrc);
});