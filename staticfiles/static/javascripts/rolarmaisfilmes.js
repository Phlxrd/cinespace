document.addEventListener('DOMContentLoaded', function() {
    const carrosselFilmes = document.querySelector('.carrossel-filmes-content');
    const leftArrowFilmes = document.querySelector('.carrossel-filmes .left-arrow');
    const rightArrowFilmes = document.querySelector('.carrossel-filmes .right-arrow');
    
    let scrollAmount = 0;
    const itemWidth = 300; // A largura mínima dos itens do carrossel, ajuste conforme necessário
    const visibleItems = 3; // Número de itens visíveis no carrossel, ajuste conforme necessário
    const totalWidth = itemWidth * visibleItems;
    
    rightArrowFilmes.addEventListener('click', () => {
      if (scrollAmount < carrosselFilmes.scrollWidth - carrosselFilmes.clientWidth) {
        scrollAmount += totalWidth;
        carrosselFilmes.style.transform = `translateX(-${scrollAmount}px)`;
      }
    });

    leftArrowFilmes.addEventListener('click', () => {
      if (scrollAmount > 0) {
        scrollAmount -= totalWidth;
        carrosselFilmes.style.transform = `translateX(-${scrollAmount}px)`;
      }
    });
  });