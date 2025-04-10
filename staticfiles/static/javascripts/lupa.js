document.addEventListener('DOMContentLoaded', () => {
    const searchIcon = document.getElementById('search-icon');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const closeButton = document.getElementById('close-search');
    const themeToggleButton = document.getElementById('theme-toggle');
    const searchForm = document.getElementById('search-form');
    const carouselItems = document.querySelectorAll('.carousel-item'); // Seleciona todos os itens do carrossel

    // Mostrar a barra de pesquisa
    searchIcon.addEventListener('click', () => {
        searchContainer.classList.add('show');
        searchContainer.classList.remove('hidden');
        searchInput.focus();
        document.querySelector('header').classList.add('search-active');
    });

    // Fechar a barra de pesquisa
    closeButton.addEventListener('click', () => {
        searchContainer.classList.remove('show');
        searchContainer.classList.add('hidden');
        document.querySelector('header').classList.remove('search-active');
    });

    // Pesquisar ao digitar
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        carouselItems.forEach(item => {
            const title = item.querySelector('p').textContent.toLowerCase(); // Assume que o título está dentro de um <p>
            if (title.includes(searchTerm)) {
                item.style.display = ''; // Exibe o item se o título contiver o termo
            } else {
                item.style.display = 'none'; // Oculta o item se não contiver o termo
            }
        });
    });
    });

