// Cria o player do YouTube
let player;

// Função que será chamada quando a API do YouTube for carregada
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player-container', {
        height: '360',
        width: '640',
        videoId: 'dQw4w9WgXcQ', // Substitua pelo ID do vídeo do YouTube
        playerVars: {
            'autoplay': 1, // Inicia o vídeo automaticamente
            'controls': 1, // Exibe os controles do player
            'mute': 1 // Inicia o vídeo sem som
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Quando o player estiver pronto
function onPlayerReady(event) {
    // O vídeo começa a tocar automaticamente
    event.target.playVideo();
}

// Quando o estado do player mudar
function onPlayerStateChange(event) {
    // Adicione comportamento quando o estado do player mudar, se necessário
}
