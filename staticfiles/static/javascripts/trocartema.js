// Seleciona o botão e os elementos que devem ser afetados pelo tema
const themeSwitch = document.getElementById('theme-switch');
const elementsToTheme = document.querySelectorAll('body, header, nav, .carousel, .nav-menu li a');

// Função para aplicar o tema claro
function applyLightTheme() {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    elementsToTheme.forEach(element => element.classList.add('light-theme'));
}

// Função para aplicar o tema escuro
function applyDarkTheme() {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    elementsToTheme.forEach(element => element.classList.remove('light-theme'));
}

// Verifica se o tema claro já estava salvo no localStorage
if (localStorage.getItem('theme') === 'light') {
    themeSwitch.checked = true;
    applyLightTheme();
} else {
    themeSwitch.checked = false;
    applyDarkTheme();
}

// Adiciona um evento de clique ao botão
themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        applyLightTheme();
        localStorage.setItem('theme', 'light');
    } else {
        applyDarkTheme();
        localStorage.setItem('theme', 'dark');
    }
});
