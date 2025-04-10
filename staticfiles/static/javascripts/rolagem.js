// Seleciona todos os carrosséis e botões
const carousels = document.querySelectorAll('.carousel');
const leftArrows = document.querySelectorAll('.left-arrow');
const rightArrows = document.querySelectorAll('.right-arrow');

// Define a quantidade de pixels para deslizar
const scrollAmount = 800;

// Função para adicionar eventos de clique aos botões
const addCarouselEventListeners = (carousel, leftArrow, rightArrow) => {
    leftArrow.addEventListener('click', () => {
        carousel.scrollBy({
            top: 0,
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    rightArrow.addEventListener('click', () => {
        carousel.scrollBy({
            top: 0,
            left: scrollAmount,
            behavior: 'smooth'
        });
    });
};

// Adiciona eventos para cada carrossel e seus botões
carousels.forEach((carousel, index) => {
    const leftArrow = leftArrows[index];
    const rightArrow = rightArrows[index];
    addCarouselEventListeners(carousel, leftArrow, rightArrow);
});
