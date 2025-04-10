// Desabilita o clique com o botão direito em toda a página
document.addEventListener("contextmenu", (event) => {
    event.preventDefault(); // Impede o menu de contexto padrão
});

// Impede a seleção de texto com o mouse
document.addEventListener("selectstart", (event) => {
    event.preventDefault(); // Impede a seleção de texto
});

// Impede o arrasto de imagens e outros elementos
document.addEventListener("dragstart", (event) => {
    event.preventDefault(); // Impede o arrasto
});

// Adiciona estilo CSS para desativar a seleção visualmente
const style = document.createElement("style");
style.textContent = `
    * {
        user-select: none; /* Desativa a seleção de texto */
        -webkit-user-select: none; /* Compatibilidade com navegadores baseados em Webkit */
        -ms-user-select: none; /* Compatibilidade com IE */
    }
`;
document.head.appendChild(style);