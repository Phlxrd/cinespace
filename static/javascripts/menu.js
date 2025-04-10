document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('overlay');
    const closeMenu = document.getElementById('close-menu');

    menuIcon.addEventListener('click', () => {
        sideMenu.style.transform = 'translateX(0)';
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
    });

    closeMenu.addEventListener('click', () => {
        sideMenu.style.transform = 'translateX(-100%)';
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
    });

    // Fechar o menu quando o overlay for clicado
    overlay.addEventListener('click', () => {
        sideMenu.style.transform = 'translateX(-100%)';
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
    });
});
