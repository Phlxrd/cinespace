document.addEventListener("DOMContentLoaded", function () {
    // Seleciona todos os carrosséis e suas setas
    const carousels = document.querySelectorAll('.carousel-container, .carrossel-4, .carousel-container-elenco');
    const leftArrows = document.querySelectorAll('.left-arrow, .left-arrow-dois, .left-arrow-tres, .left-arrow-quatro, .left-arrow-elenco');
    const rightArrows = document.querySelectorAll('.right-arrow, .right-arrow-dois, .right-arrow-tres, .right-arrow-quatro, .right-arrow-elenco');

    // Define a quantidade de pixels para deslizar
    const scrollAmount = 200; // Reduzido para deslizar menos

    // Função para adicionar eventos de clique aos botões
    const addCarouselEventListeners = (carousel, leftArrow, rightArrow) => {
        const innerCarousel = carousel.querySelector('.carousel, .serie-container, .carrossel-elenco');

        leftArrow.addEventListener('click', () => {
            innerCarousel.scrollBy({
                top: 0,
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        rightArrow.addEventListener('click', () => {
            innerCarousel.scrollBy({
                top: 0,
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        // Mostra as setas ao passar o mouse sobre o carrossel
        carousel.addEventListener('mouseenter', () => {
            leftArrow.style.display = 'block';
            rightArrow.style.display = 'block';
        });

        carousel.addEventListener('mouseleave', () => {
            leftArrow.style.display = 'none';
            rightArrow.style.display = 'none';
        });
    };

    // Adiciona eventos para cada carrossel e seus botões
    carousels.forEach((carousel, index) => {
        const leftArrow = leftArrows[index];
        const rightArrow = rightArrows[index];
        addCarouselEventListeners(carousel, leftArrow, rightArrow);
    });
});