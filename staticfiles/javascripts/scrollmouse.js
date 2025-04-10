var carousel = document.querySelector('.carousel');

carousel.addEventListener('wheel', (event) => {
    event.preventDefault();

    // Define a quantidade de pixels para deslizar
    const scrollAmount = 300; // Ajuste conforme necessário

    // Verifica a direção do scroll
    if (event.deltaY > 0) {
        // Desliza para a direita
        carousel.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    } else {
        // Desliza para a esquerda
        carousel.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    }
});