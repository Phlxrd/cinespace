// Seleciona o botão de troca de tema
const themeToggleButton = document.getElementById('theme-toggle');

// Verifica o tema salvo no localStorage e aplica-o
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.body.classList.add(savedTheme + '-theme');
    themeToggleButton.textContent = savedTheme === 'light' ? '🌙 Modo Escuro' : '🌞 Modo Claro';
} else {
    // Define o tema padrão como escuro, se não houver tema salvo
    document.body.classList.add('dark-theme');
    themeToggleButton.textContent = '🌞 Modo Claro';
}

// Adiciona um evento de clique ao botão para alternar os temas
themeToggleButton.addEventListener('click', () => {
    // Alterna entre temas
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        themeToggleButton.textContent = '🌙 Modo Escuro';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        themeToggleButton.textContent = '🌞 Modo Claro';
        localStorage.setItem('theme', 'dark');
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('#theme-toggle');

    // Carrega o tema do localStorage
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(`${currentTheme}-mode`);

    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('light-mode')) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        }
    });
});