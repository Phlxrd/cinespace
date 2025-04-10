document.addEventListener("DOMContentLoaded", function () {
    // --- EXPANDIR E CONTRAIR DETALHES DOS DISPOSITIVOS ---
    window.expandirDispositivos = function () {
        const dispositivosOcultos = document.querySelectorAll(".dispositivo-oculto");
        dispositivosOcultos.forEach(dispositivo => {
            if (dispositivo.style.display === "flex") {
                dispositivo.style.display = "none";
            } else {
                dispositivo.style.display = "flex";
            }
        });
    };

    // --- ALTERAR ÍCONE DO SISTEMA OPERACIONAL ---
    const imgSistemas = document.querySelectorAll(".dispositivo-icon");

    imgSistemas.forEach(imgSistema => {
        if (imgSistema && imgSistema.dataset.sistema) {
            let sistema = imgSistema.dataset.sistema.trim().toLowerCase();
            console.log("Sistema detectado:", sistema);  // Adicione esta linha para depuração
            let icones = {
                "windows": "https://img.icons8.com/ios11/600/FFFFFF/windows-10.png",
                "macos": "https://example.com/macosLogo.png",
                "linux": "https://logospng.org/download/linux/linux-4096.png",  // Atualize este URL
                "android": "https://example.com/androidLogo.png",
                "ios": "https://example.com/iosLogo.png"
            };

            console.log("URL do ícone:", icones[sistema]);  // Adicione esta linha para depuração
            imgSistema.src = icones[sistema] || "https://example.com/defaultLogo.png";
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const messages = document.querySelectorAll(".messages .error, .messages .success");
    const delay = 3000; // 3 segundos

    messages.forEach(message => {
        setTimeout(() => {
            message.classList.add("fade-out"); // Adiciona a classe de fade-out
            setTimeout(() => {
                message.remove(); // Remove a mensagem após a animação
            }, 500); // Tempo da animação (0.5 segundos)
        }, delay);
    });
});