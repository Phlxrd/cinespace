// --- Variáveis Globais ---
const editModal = document.getElementById('edit-profile-modal');
const deleteModal = document.getElementById('delete-profile-modal');
const profileModal = document.getElementById('profile-modal');
const overlay = document.getElementById('overlay');
const editProfileForm = document.getElementById('edit-profile-form');
const nomeUsuarioInput = document.getElementById('nome_usuario');
const selectedImagePreview = document.getElementById('selected-image-preview');
const alterarText = document.getElementById('alterar-text');
const editIcon = document.getElementById('edit-icon');
const dataNascimentoGroup = document.querySelector('.form-group[data-nascimento]');

let profileIdToDelete = null;
let selectedImage = null;
let isPerfilInfantil = false; // Variável global adicionada

// --- Funções Principais ---
function openEditProfileModal(perfilId, nomeUsuario, dataNascimento, imagem, isInfantil) {
    // Atualiza o estado global
    isPerfilInfantil = isInfantil;
    
    // Preenche os campos do formulário
    document.getElementById('nome_usuario').value = nomeUsuario;
    document.getElementById('edit-profile-id').value = perfilId;
    selectedImagePreview.src = imagem;
    
    // Controla a visibilidade do campo de data de nascimento
    if (dataNascimentoGroup) {
        dataNascimentoGroup.style.display = isInfantil ? 'none' : 'block';
    }

    // Preenche a data de nascimento apenas se não for perfil infantil
    if (!isInfantil && dataNascimento) {
        // Garante que a data está no formato YYYY-MM-DD
        const dateObj = new Date(dataNascimento);
        const formattedDate = dateObj.toISOString().split('T')[0];
        document.getElementById('data_nascimento').value = formattedDate;
        
        // Formata a data para exibição (dd/mm/aaaa)
        const [ano, mes, dia] = formattedDate.split('-');
        document.getElementById('data_nascimento_mensagem').value = `${dia}/${mes}/${ano}`;
    } else {
        document.getElementById('data_nascimento').value = '';
        document.getElementById('data_nascimento_mensagem').value = '';
    }

    // Exibe o modal
    editModal.style.display = 'block';
    overlay.style.display = 'block';
}


function toggleDataNascimentoVisibility(isInfantil) {
    const dataNascimentoGroup = document.querySelector('.form-group[data-nascimento]');
    if (dataNascimentoGroup) {
        dataNascimentoGroup.style.display = isInfantil ? 'none' : 'block';
        
        // Limpa os campos se for perfil infantil
        if (isInfantil) {
            document.getElementById('dia').value = '';
            document.getElementById('mes').value = '';
            document.getElementById('ano').value = '';
            document.getElementById('data_nascimento').value = '';
        }
    }
}

function closeEditProfileModal() {
    editModal.style.display = 'none';
    overlay.style.display = 'none';
    // Removido o reset do formulário
    selectedImagePreview.src = "";
    selectedImage = null;
}
// --- Funções para Manipulação de Imagens ---
function openImageSelectionModal() {
    closeEditProfileModal();
    if (selectedImage) {
        localStorage.setItem('tempSelectedImage', selectedImage);
    }
    openProfileModal();
}

function selectImage(event) {
    const selectedLabel = event.target.closest('label');
    if (!selectedLabel) return;

    const selectedRadio = selectedLabel.querySelector('input[type="radio"]');
    if (selectedRadio) {
        selectedImage = selectedRadio.value;
        selectedImagePreview.src = selectedLabel.querySelector('img').src;
        closeProfileModal();
        openEditProfileModal(
            document.getElementById('edit-profile-id').value,
            document.getElementById('nome').value,
            document.getElementById('nome_usuario').value,
            document.getElementById('data_nascimento').value,
            selectedImagePreview.src,
            isPerfilInfantil
        );
    }
}

// --- Funções para Exclusão de Perfil ---
function openDeleteProfileModal() {
    profileIdToDelete = document.getElementById('edit-profile-id').value;
    deleteModal.style.display = 'block';
    overlay.style.display = 'block';
}

function closeDeleteProfileModal() {
    deleteModal.style.display = 'none';
    overlay.style.display = 'none';
}

function confirmDeleteProfile() {
    const formData = new FormData();
    formData.append('perfil_id', profileIdToDelete);
    formData.append('excluir', '');

    fetch('/gerenciar_perfis/', {
        method: 'POST',
        body: formData,
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('profile-' + profileIdToDelete).remove();
            closeDeleteProfileModal();
            location.reload();
        } else {
            console.error(data.message || "Erro ao excluir perfil.");
        }
    })
    .catch(error => console.error('Erro:', error));
}
// --- Função para Envio do Formulário ---
editProfileForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData();
    const perfilId = document.getElementById('edit-profile-id').value;
    const nomeUsuario = document.getElementById('nome_usuario').value;
    
    // Verifica se é perfil infantil (pode ser ajustado conforme seu HTML)
    const isInfantil = dataNascimentoGroup.style.display === 'none';

    formData.append('edit_profile_id', perfilId);
    formData.append('nome_usuario', nomeUsuario);
    formData.append('perfil_infantil', isInfantil ? 'on' : 'off');
    
    // Só envia a data de nascimento se não for perfil infantil
    if (!isInfantil) {
        const dataNascimento = document.getElementById('data_nascimento').value;
        if (dataNascimento) {
            formData.append('data_nascimento', dataNascimento);
        }
    }
    
    // Adiciona a imagem se foi selecionada
    if (selectedImage) {
        formData.append('imagem', selectedImage);
    }

    fetch('/gerenciar_perfis/', {
        method: 'POST',
        body: formData,
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const profileElement = document.getElementById('profile-' + perfilId);
            if (profileElement) {
                profileElement.querySelector('.user-name').textContent = data.nome_usuario;
                if (data.imagem) {
                    profileElement.querySelector('.profile-image').src = data.imagem;
                }
            }
            closeEditProfileModal();
            location.reload(); // Recarrega para atualizar todos os dados
        } else {
            alert(data.message || 'Erro ao atualizar perfil. Tente novamente.');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor. Tente novamente.');
    });
});

// --- Funções Auxiliares ---
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// --- Event Listeners Globais ---
window.onclick = function(event) {
    if (event.target === editModal || event.target === overlay) {
        closeEditProfileModal();
    }
    if (event.target === deleteModal) {
        closeDeleteProfileModal();
    }
    if (event.target === profileModal) {
        closeProfileModal();
    }
};

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeEditProfileModal();
        closeDeleteProfileModal();
        closeProfileModal();
    }
});

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', function() {
    // Configuração dos listeners de imagem
    if (alterarText) {
        alterarText.addEventListener('click', openImageSelectionModal);
    }
    if (editIcon) {
        editIcon.addEventListener('click', openImageSelectionModal);
    }
    
    const profileOptions = document.querySelectorAll('.profile-option');
    profileOptions.forEach((image) => {
        image.addEventListener('click', selectImage);
    });

    // Configura o toggle do perfil infantil
    const perfilInfantilToggle = document.getElementById('perfil_infantil');
    if (perfilInfantilToggle) {
        perfilInfantilToggle.addEventListener('change', function() {
            isPerfilInfantil = this.checked;
            toggleDataNascimentoVisibility(isPerfilInfantil);
        });
    }
});

// Função chamada quando clica no ícone de edição
function editProfile(event, perfilId, nomeUsuario, dataNascimento, imagem, isInfantil) {
    event.stopPropagation();
    const imagemUrl = imagem.startsWith('/') ? imagem : '/' + imagem;
    openEditProfileModal(perfilId, nomeUsuario, dataNascimento, imagemUrl, isInfantil);
}


// --- Funções para Seleção de Imagem ---
function openProfileModal() {
    profileModal.style.display = 'block';
    overlay.style.display = 'block';
}

function closeProfileModal() {
    profileModal.style.display = 'none';
    overlay.style.display = 'none';
}

// --- Funções para Manipulação de Imagens ---
function openImageSelectionModal() {
    // Salva o estado atual antes de abrir a seleção de imagem
    const currentState = {
        id: document.getElementById('edit-profile-id').value,
        nomeUsuario: document.getElementById('nome_usuario').value,
        dataNascimento: document.getElementById('data_nascimento').value,
        imagem: selectedImagePreview.src,
        isInfantil: isPerfilInfantil // Agora acessa a variável global
    };
    localStorage.setItem('currentEditState', JSON.stringify(currentState));
    
    closeEditProfileModal();
    openProfileModal();
}

function selectImage(event) {
    const selectedLabel = event.target.closest('label');
    if (!selectedLabel) return;

    const selectedRadio = selectedLabel.querySelector('input[type="radio"]');
    if (selectedRadio) {
        selectedImage = selectedRadio.value;
        selectedImagePreview.src = selectedLabel.querySelector('img').src;
        closeProfileModal();
        
        // Restaura o estado anterior
        const savedState = JSON.parse(localStorage.getItem('currentEditState'));
        if (savedState) {
            openEditProfileModal(
                savedState.id,
                savedState.nomeUsuario,
                savedState.dataNascimento,
                selectedImagePreview.src,
                savedState.isInfantil
            );
        }
    }
}

// --- Atualização da Inicialização ---
document.addEventListener('DOMContentLoaded', function() {
    // Configuração dos listeners de imagem
    if (alterarText) {
        alterarText.addEventListener('click', function(e) {
            e.stopPropagation();
            openImageSelectionModal();
        });
    }
    
    if (editIcon) {
        editIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            openImageSelectionModal();
        });
    }
    
    const profileOptions = document.querySelectorAll('.profile-option');
    profileOptions.forEach((image) => {
        image.addEventListener('click', selectImage);
    });

    // Restante do código de inicialização...
    const perfilInfantilToggle = document.getElementById('perfil_infantil');
    if (perfilInfantilToggle) {
        perfilInfantilToggle.addEventListener('change', function() {
            isPerfilInfantil = this.checked;
            toggleDataNascimentoVisibility(isPerfilInfantil);
        });
    }
});