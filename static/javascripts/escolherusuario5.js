// --- Variáveis Globais ---
const loadingOverlay = document.getElementById("loading-overlay");

// --- Funções Relacionadas aos Modais ---

// Abre o modal de seleção de imagem
function openCreateProfileModal() {
    const modal = document.getElementById('profile-modal');
    const modalOverlay = document.getElementById('overlay');
    if (modal && modalOverlay) {
        modal.style.display = 'block';
        modalOverlay.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
            modalOverlay.classList.add('show');
        }, 10);

        // Carrega imagem selecionada do localStorage
        const savedImage = localStorage.getItem('tempSelectedImage');
        if (savedImage) {
            const input = document.querySelector(`input[name="imagem_preset"][value="${savedImage}"]`);
            if (input) {
                input.checked = true;
            }
        }
    } else {
        console.error('Modal ou overlay não encontrado.');
    }
}

// Fecha o modal de seleção de imagem
function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    const modalOverlay = document.getElementById('overlay');
    if (modal && modalOverlay) {
        modal.style.display = 'none';
        modalOverlay.style.display = 'none';
        modal.classList.remove('show');
        modalOverlay.classList.remove('show');

        // Limpa a imagem do localStorage
        localStorage.removeItem('tempSelectedImage');

        // Limpa a seleção da imagem
        const selectedInput = document.querySelector('input[name="imagem_preset"]:checked');
        if (selectedInput) {
            selectedInput.checked = false;
            const selectedImage = selectedInput.nextElementSibling;
            selectedImage.classList.remove('hover');
        }
    }
}

// Abre o modal de detalhes do perfil
function openProfileDetailsModal(image) {
    closeProfileModal(); // Fecha o modal de seleção, se estiver aberto
    const modal = document.getElementById('profile-details-modal');
    const modalOverlay = document.getElementById('overlay');
    if (modal && modalOverlay) {
        modal.style.display = 'block';
        modalOverlay.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
            modalOverlay.classList.add('show');
        }, 10);

        // Armazena a imagem selecionada em um campo oculto
        document.getElementById('imagem_selecionada').value = image;

        // Exibe a imagem selecionada
        const imagePreview = document.getElementById('selected-image-preview');
        if (imagePreview) {
            const selectedInput = document.querySelector(`input[name="imagem_preset"][value="${image}"]`);
            if (selectedInput) {
                imagePreview.src = selectedInput.nextElementSibling.src;
            }
        }
    }
}

// Fecha o modal de detalhes do perfil
function closeProfileDetailsModal() {
    const modal = document.getElementById('profile-details-modal');
    const modalOverlay = document.getElementById('overlay');
    if (modal && modalOverlay) {
        modal.style.display = 'none';
        modalOverlay.style.display = 'none';
        modal.classList.remove('show');
        modalOverlay.classList.remove('show');
        localStorage.removeItem('tempSelectedImage');
    }
}

// --- Função para Reabrir o Modal de Seleção ---
function openImageSelectionModal() {
    closeProfileDetailsModal();
    // Armazena temporariamente a imagem selecionada
    const currentSelected = document.getElementById('imagem_selecionada').value;
    if (currentSelected) {
        localStorage.setItem('tempSelectedImage', currentSelected);
    }

    // Adiciona a classe no-transition
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.classList.add('no-transition');
    }

    openCreateProfileModal();
}

// --- Funções Relacionadas à Seleção de Imagens ---

function handleImageSelection() {
    const imageInputs = document.querySelectorAll('input[name="imagem_preset"]');
    imageInputs.forEach(input => {
        input.addEventListener('change', function () {
            const selectedImage = this.value;
            const selectedImageSrc = this.nextElementSibling.src;

            // Armazena a imagem selecionada em um campo oculto
            document.getElementById('imagem_selecionada').value = selectedImage;

            // Exibe a imagem selecionada no segundo modal
            const imagePreview = document.getElementById('selected-image-preview');
            imagePreview.src = selectedImageSrc;
            imagePreview.alt = `Imagem Selecionada: ${selectedImage}`;

            // Limpa a imagem do localStorage
            localStorage.removeItem('tempSelectedImage');

            // Abre o segundo modal
            openProfileDetailsModal(selectedImage);
        });
    });
}

// --- Função para Criar Perfil ---
// --- Atualização da Função createProfile para Validar Melhor ---
function createProfile(event) {
    event.preventDefault();
    const form = document.getElementById('create-profile-form');
    const formData = new FormData(form);
    const perfilInfantil = document.getElementById('perfil_infantil').checked;

    // Adiciona perfil_infantil ao FormData
    formData.append('perfil_infantil', perfilInfantil ? 'on' : 'off');

    // Validação específica para perfis não-infantis
    if (!perfilInfantil) {
        const dia = document.getElementById('dia').value;
        const mes = document.getElementById('mes').value;
        const ano = document.getElementById('ano').value;

        if (!dia || !mes || !ano) {
            alert('Para perfis não-infantis, por favor preencha a data de nascimento completa.');
            return;
        }

        // Garante que a data está no formato correto
        const dataNascimento = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        formData.set('data_nascimento', dataNascimento);
    } else {
        // Remove completamente a data para perfis infantis
        formData.delete('data_nascimento');
        formData.delete('dia');
        formData.delete('mes');
        formData.delete('ano');
    }

    // Restante da função de envio...
    fetch(criarPerfilUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': '{{ csrf_token }}'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro na requisição');
        return response.json();
    })
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Erro: ' + (data.message || 'Erro desconhecido'));
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao criar perfil. Verifique o console.');
    });
}

// --- Função para Ocultar o Campo de Data de Nascimento ---
// --- Função para Ocultar e Limpar o Campo de Data de Nascimento ---
function toggleDataNascimento() {
    const perfilInfantilToggle = document.getElementById('perfil_infantil');
    const dataNascimentoContainer = document.querySelector('.form-group[data-nascimento]');
    const diaInput = document.getElementById('dia');
    const mesInput = document.getElementById('mes');
    const anoInput = document.getElementById('ano');
    const dataNascimentoInput = document.getElementById('data_nascimento');

    if (perfilInfantilToggle && dataNascimentoContainer) {
        // Adiciona um evento de mudança ao toggle
        perfilInfantilToggle.addEventListener('change', function() {
            if (this.checked) {
                dataNascimentoContainer.style.display = 'none';

                // Limpa os campos de data
                diaInput.value = '';
                mesInput.value = '';
                anoInput.value = '';
                dataNascimentoInput.value = '';
            } else {
                dataNascimentoContainer.style.display = 'block';
            }
        });

        // Verifica o estado inicial do toggle ao carregar a página
        if (perfilInfantilToggle.checked) {
            dataNascimentoContainer.style.display = 'none';

            // Garante que os campos estão limpos inicialmente se for infantil
            diaInput.value = '';
            mesInput.value = '';
            anoInput.value = '';
            dataNascimentoInput.value = '';
        } else {
            dataNascimentoContainer.style.display = 'block';
        }
    }
}

// --- Função para Atualizar o Nome do Perfil no Modal ---

function atualizarNomePerfilNoModal() {
    const nomePerfilInput = document.getElementById('nome_usuario');
    const profileNamePreview = document.getElementById('profile-name-preview');

    if (nomePerfilInput && profileNamePreview) {
        nomePerfilInput.addEventListener('input', function () {
            const nomePerfil = this.value.trim();
            profileNamePreview.textContent = nomePerfil || "Nome do Perfil";
        });
    }
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', function () {
    // Configura os listeners de seleção de imagem
    handleImageSelection();

    // Configura o toggle para o campo de data de nascimento
    toggleDataNascimento();

    // Configura a atualização do nome do perfil
    atualizarNomePerfilNoModal();

    // Adiciona evento de envio ao formulário
    const createProfileForm = document.getElementById('create-profile-form');
    if (createProfileForm) {
        createProfileForm.addEventListener('submit', createProfile);
    }


    // Fechar modais com a tecla ESC
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeProfileModal();
            closeProfileDetailsModal();
        }
    });

    // Event listeners para abrir o modal de seleção de imagem apenas no ícone de "Criar novo perfil"
    const addProfileIcon = document.querySelector('.add-profile-icon');
    if (addProfileIcon) {
        addProfileIcon.addEventListener('click', openCreateProfileModal);
    }

    // Event listeners para os ícones de perfil existentes
    const profilePlaceholders = document.querySelectorAll('.profile-placeholder');
    profilePlaceholders.forEach(placeholder => {
        placeholder.addEventListener('click', function () {
            const perfilId = this.id.replace('profile-', '');
            selectProfile(perfilId); // Redireciona para a página do perfil
        });
    });

    const manageProfileButton = document.querySelector('.manage-profile-button');
    if (manageProfileButton) {
        manageProfileButton.addEventListener('click', function () {
            window.location.href = gerenciarPerfisUrl;
        });
    }

    // Configuração dos inputs de data de nascimento
    const diaInput = document.getElementById('dia');
    const mesInput = document.getElementById('mes');
    const anoInput = document.getElementById('ano');
    const dataNascimentoInput = document.getElementById('data_nascimento');

    if (diaInput && mesInput && anoInput && dataNascimentoInput) {
        function updateDataNascimento() {
            const dia = diaInput.value.padStart(2, '0');
            const mes = mesInput.value.padStart(2, '0');
            const ano = anoInput.value;

            if (dia && mes && ano) {
                dataNascimentoInput.value = `${ano}-${mes}-${dia}`; // Formato YYYY-MM-DD
            } else {
                dataNascimentoInput.value = ''; // Limpa se algum campo estiver vazio
            }
        }

        // Função para lidar com o limite de dígitos e o "pulo" automático
        function handleInput(event, maxLength, nextField) {
            const input = event.target;
            let value = input.value;

            // Remove qualquer caractere não numérico
            value = value.replace(/\D/g, '');

            if (value.length > maxLength) {
                value = value.slice(0, maxLength); // Trunca o valor se for maior que o máximo
            }

            input.value = value; // Atualiza o valor do campo (já truncado, se necessário)

            if (value.length >= maxLength && nextField) {
                nextField.focus(); // Move o foco para o próximo campo
            }
            updateDataNascimento();
        }

        // Adiciona event listeners para os campos
        diaInput.addEventListener('input', (event) => handleInput(event, 2, mesInput));
        mesInput.addEventListener('input', (event) => handleInput(event, 2, anoInput));
        anoInput.addEventListener('input', (event) => handleInput(event, 4, null)); // Sem próximo campo para o ano

        // Adiciona limitação (KeyDown)
        diaInput.addEventListener('keydown', preventInvalidKeys);
        mesInput.addEventListener('keydown', preventInvalidKeys);
        anoInput.addEventListener('keydown', preventInvalidKeys);
    }

    // --- Event listeners para abrir o modal de seleção de imagem ao clicar em "Alterar" ou no ícone de lápis ---
    const alterarTexto = document.getElementById('alterar-text');
    const editarIcone = document.getElementById('edit-icon');

    if (alterarTexto) {
        alterarTexto.addEventListener('click', openImageSelectionModal);
    }

    if (editarIcone) {
        editarIcone.addEventListener('click', openImageSelectionModal);
    }
});

// Impede letras
function preventInvalidKeys(event) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (event.ctrlKey || event.altKey) {
        return; // Permite Ctrl+C, Ctrl+V, etc.
    }
    if (!allowedKeys.includes(event.key) && isNaN(parseInt(event.key))) {
        event.preventDefault();
    }
}

// Função para selecionar um perfil e redirecionar
function selectProfile(perfilId) {
    // Exibe a barra de carregamento
    if (loadingOverlay) {
        loadingOverlay.style.display = "flex";
    }

    // Obtém o elemento do perfil
    const perfilElement = document.getElementById(`profile-${perfilId}`);
    if (!perfilElement) {
        console.error(`Perfil com ID profile-${perfilId} não encontrado.`);
        return;
    }

    // Obtém a imagem do perfil
    const profileImageElement = perfilElement.querySelector(".profile-image");
    if (!profileImageElement) {
        console.error("Imagem do perfil não encontrada.");
        return;
    }

    const profileImage = profileImageElement.src;

    // Armazena a imagem no localStorage para persistência
    localStorage.setItem("selectedProfileImage", profileImage);
    localStorage.setItem("selectedProfileId", perfilId);

    // Adiciona indicador de carregamento no sessionStorage
    sessionStorage.setItem("showLoading", "true");

    // Redireciona para a página de escolha de plataforma após 0.5 segundos
    setTimeout(() => {
        window.location.href = escolherPlataformaUrl; // Usa a variável definida no HTML
    }, 500);
}