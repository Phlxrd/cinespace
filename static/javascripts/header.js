// Adiciona classe ao header ao rolar a página
document.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    if (header) {
        if (window.scrollY > 0) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Recupera a imagem do perfil do localStorage
    const selectedProfileImage = localStorage.getItem("selectedProfileImage");
    if (selectedProfileImage) {
        const profileImages = document.querySelectorAll(".perfil-image");
        if (profileImages.length > 0) {
            profileImages.forEach(img => {
                img.src = selectedProfileImage;
            });
        } else {
            console.error("Nenhuma imagem de perfil encontrada.");
        }
    } else {
        console.warn("Nenhuma imagem de perfil encontrada no localStorage.");
    }

    // Recupera o ID do perfil selecionado do localStorage
    const selectedProfileId = localStorage.getItem("selectedProfileId");

    if (selectedProfileId) {
        // Faz uma requisição para obter os detalhes do perfil
        fetch(`/api/perfil/${selectedProfileId}/`)
            .then(response => response.json())
            .then(data => {
                // Atualiza o nome do perfil e o plano no menu
                const profileNameElement = document.getElementById('profileName');
                const profilePlanElement = document.getElementById('profilePlan');

                if (profileNameElement && profilePlanElement) {
                    profileNameElement.textContent = data.nome_usuario;
                    profilePlanElement.textContent = data.plano;
                }
            })
            .catch(error => {
                console.error('Erro ao buscar detalhes do perfil:', error);
            });
    } else {
        console.warn("Nenhum ID de perfil encontrado no localStorage.");
    }
});


// Dropdown do perfil
const profileIcon = document.getElementById("profileImage");
const profileDropdown = document.getElementById("profile-dropdown");
let hideTimeout;

// Função para mostrar o dropdown
function showDropdown() {
    clearTimeout(hideTimeout);
    if (profileDropdown) {
        profileDropdown.style.display = "block";
    }
}

// Função para esconder o dropdown com um pequeno atraso
function hideDropdown() {
    hideTimeout = setTimeout(() => {
        if (profileDropdown) {
            profileDropdown.style.display = "none";
        }
    }, 300); // Atraso de 300ms para evitar esconder muito rápido
}

// Adiciona eventos de mouse somente se os elementos existirem
if (profileIcon && profileDropdown) {
    profileIcon.addEventListener("mouseover", showDropdown);
    profileIcon.addEventListener("mouseout", hideDropdown);
    profileDropdown.addEventListener("mouseover", showDropdown);
    profileDropdown.addEventListener("mouseout", hideDropdown);
} else {
    console.error("Ícone de perfil ou dropdown não encontrado.");
}

document.addEventListener("DOMContentLoaded", function () {
    const profileHeader = document.querySelector(".profile-header");
    const menuPerfil = document.querySelector(".menu-perfil");
    let timeoutID;

    // Alternar o menu ao clicar na imagem de perfil
    profileHeader.addEventListener("click", (event) => {
        event.stopPropagation(); // Impede que o clique feche imediatamente
        if (menuPerfil.style.display === "flex") {
            menuPerfil.style.display = "none";
        } else {
            menuPerfil.style.display = "flex";
        }
    });

    // Fecha o menu quando o mouse sai tanto do perfil quanto do menu
    function fecharMenu() {
        timeoutID = setTimeout(() => {
            menuPerfil.style.display = "none";
        }, 200); // Espera 1 segundo antes de fechar
    }

    profileHeader.addEventListener("mouseleave", fecharMenu);
    menuPerfil.addEventListener("mouseleave", fecharMenu);

    // Impede que o menu feche se o mouse estiver sobre ele
    menuPerfil.addEventListener("mouseenter", () => {
        clearTimeout(timeoutID);
    });

    // Fecha o menu se clicar fora dele
    document.addEventListener("click", (event) => {
        if (!profileHeader.contains(event.target) && !menuPerfil.contains(event.target)) {
            menuPerfil.style.display = "none";
        }
    });
});



