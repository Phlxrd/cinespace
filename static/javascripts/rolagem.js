document.addEventListener("DOMContentLoaded", function () {
    const carousels = document.querySelectorAll('.carousel-container, .carrossel-4, .carousel-container-atores');
    const scrollAmount = 700;

    // Função para adicionar eventos de clique aos botões
    const addCarouselEventListeners = (carousel) => {
        const leftArrow = carousel.querySelector('.left-arrow, .left-arrow-dois, .left-arrow-tres, .left-arrow-quatro, .left-arrow-atores');
        const rightArrow = carousel.querySelector('.right-arrow, .right-arrow-dois, .right-arrow-tres, .right-arrow-quatro, .right-arrow-atores');
        const innerCarousel = carousel.querySelector('.carousel, .serie-container, .carrossel-atores');

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

    // Adiciona eventos para cada carrossel
    carousels.forEach((carousel) => {
        addCarouselEventListeners(carousel);
    });

    // Faz o carrossel girar no primeiro clique na seta do perfil
    const profileArrow = document.querySelector('.profile-header .seta-perfil');
    const firstCarousel = document.querySelector('.carousel-container-atores .carrossel-atores');

    if (profileArrow && firstCarousel) {
        profileArrow.addEventListener('click', () => {
            firstCarousel.scrollBy({
                top: 0,
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
    }
});
