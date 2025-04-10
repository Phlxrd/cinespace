// Seleciona os elementos do carrossel e dos vídeos
const carousel = document.querySelector('.carrossel');
const items = document.querySelectorAll('.item');
const leftArrow = document.querySelector('.carrossel-control.left');
const rightArrow = document.querySelector('.carrossel-control.right');

// Variável para armazenar o índice do item atual
let currentIndex = 0;

// Função para parar todos os vídeos
function pauseAllVideos() {
    items.forEach(item => {
        const iframe = item.querySelector('iframe');
        if (iframe) {
            const src = iframe.src;
            iframe.src = ''; // Remove o src para parar o vídeo
            iframe.src = src; // Restaura o src para o vídeo começar do início
        }
    });
}

// Função para exibir o item atual
function showItem(index) {
    pauseAllVideos(); // Para todos os vídeos
    carousel.style.transform = `translateX(-${index * 100}%)`;
}

// Função para mover o carrossel para o próximo item
function moveToNextItem() {
    if (currentIndex < items.length - 1) {
        currentIndex++;
        showItem(currentIndex);
    }
}

// Função para mover o carrossel para o item anterior
function moveToPrevItem() {
    if (currentIndex > 0) {
        currentIndex--;
        showItem(currentIndex);
    }
}

// Adiciona event listeners aos botões do carrossel
leftArrow.addEventListener('click', moveToPrevItem);
rightArrow.addEventListener('click', moveToNextItem);

// Inicializa a página com o primeiro item visível
window.addEventListener('load', () => {
    showItem(currentIndex);
});
let startX;
let isDragging = false;

carousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
});

carousel.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;

    if (Math.abs(diffX) > 50) { // Ajuste a sensibilidade conforme necessário
        if (diffX > 0) {
            moveToNextItem();
        } else {
            moveToPrevItem();
        }
    }
    isDragging = false;
});
