document.addEventListener('DOMContentLoaded', () => {
    // Seleciona o iframe do vídeo
    const videoIframe = document.querySelector('.video-container iframe');
    
    // Verifica se o iframe está presente
    if (videoIframe) {
        // Define a URL do iframe com autoplay
        const src = videoIframe.getAttribute('src');
        const autoplaySrc = src + (src.includes('?') ? '&' : '?') + 'autoplay=1';
        videoIframe.setAttribute('src', autoplaySrc);
    }
});