document.addEventListener('DOMContentLoaded', function() {
    const showCastButton = document.getElementById('show-cast');
    const castCarousel = document.getElementById('cast-carousel');

    // Inicialmente, o carrossel deve estar escondido
    castCarousel.style.display = 'none';

    showCastButton.addEventListener('click', function() {
        if (castCarousel.style.display === 'none' || castCarousel.style.display === '') {
            castCarousel.style.display = 'block';
        } else {
            castCarousel.style.display = 'none';
        }
    });
});