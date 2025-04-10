// Seleciona o botão e os elementos que devem ser afetados pelo tema
const themeToggleButton = document.getElementById('theme-toggle');
const elementsToTheme = document.querySelectorAll('body, header, nav, .carousel, .nav-menu li a');

// Verifica se o tema claro já estava salvo no localStorage
if (localStorage.getItem('theme') === 'light') {
    elementsToTheme.forEach(element => element.classList.add('light-theme'));
    themeToggleButton.textContent = '🌙 Modo Escuro';
}

// Adiciona um evento de clique ao botão
themeToggleButton.addEventListener('click', () => {
    // Alterna entre as classes de tema para todos os elementos
    elementsToTheme.forEach(element => element.classList.toggle('light-theme'));

    // Verifica qual tema está ativo e atualiza o texto do botão e o localStorage
    if (document.body.classList.contains('light-theme')) {
        themeToggleButton.textContent = '🌙 Modo Escuro';
        localStorage.setItem('theme', 'light');
    } else {
        themeToggleButton.textContent = '🌞 Modo Claro';
        localStorage.setItem('theme', 'dark');
    }
});
