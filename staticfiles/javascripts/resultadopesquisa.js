document.addEventListener('DOMContentLoaded', () => {
    const searchIcon = document.getElementById('search-icon');
    const searchContainer = document.getElementById('search-container');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    // Alterna a visibilidade do formulário de pesquisa
    searchIcon.addEventListener('click', () => {
        if (searchContainer.style.display === 'none') {
            searchContainer.style.display = 'block';
            searchInput.focus();
        } else {
            searchContainer.style.display = 'none';
        }
    });

    // Quando o botão de pesquisa é clicado
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `resultados.html?query=${encodeURIComponent(query)}`;
        }
    });

    // Opcional: permitir envio da pesquisa ao pressionar Enter
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });
});
