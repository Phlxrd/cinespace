
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-trailers');
    const dropdownContent = document.querySelector('.dropdown-content-trailers');

    // Abre o dropdown quando o botão é passado o mouse por cima
    toggleButton.addEventListener('mouseover', () => {
        dropdownContent.classList.add('show');
    });

    // Fecha o dropdown quando o mouse sai do botão e do conteúdo do dropdown
    document.addEventListener('mouseover', (event) => {
        if (!toggleButton.contains(event.target) && !dropdownContent.contains(event.target)) {
            dropdownContent.classList.remove('show');
        }
    });

    // Fecha o dropdown quando clicar em um dos botões dentro do dropdown
    dropdownContent.addEventListener('click', () => {
        dropdownContent.classList.remove('show');
    });
});

    // Função para trocar o trailer
    window.changeTrailer = function (videoId) {
        const player = document.getElementById('trailer-video');
        player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        dropdownContent.classList.remove('show'); // Fecha o dropdown após selecionar o trailer
    };
