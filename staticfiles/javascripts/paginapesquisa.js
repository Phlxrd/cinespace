// Função para alternar o menu de perfil
document.addEventListener("DOMContentLoaded", function () {
    const profileHeader = document.querySelector(".profile-header");
    const menuPerfil = document.querySelector(".menu-perfil");
    const arrowIcon = document.getElementById("arrowIcon");
    let timeoutID;

    // Alternar o menu ao clicar na imagem de perfil
    profileHeader.addEventListener("click", (event) => {
        event.stopPropagation(); // Impede que o clique feche imediatamente

        if (menuPerfil.style.display === "flex") {
            menuPerfil.style.display = "none";
            arrowIcon.style.transform = "rotate(0deg)"; // Volta ao normal
        } else {
            menuPerfil.style.display = "flex";
            arrowIcon.style.transform = "rotate(40deg)"; // Inclina para a direita
        }
    });

    // Fecha o menu quando o mouse sai tanto do perfil quanto do menu
    function fecharMenu() {
        timeoutID = setTimeout(() => {
            menuPerfil.style.display = "none";
            arrowIcon.style.transform = "rotate(0deg)"; // Volta ao normal ao fechar
        }, 200); // Espera 200ms antes de fechar
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
            arrowIcon.style.transform = "rotate(0deg)"; // Volta ao normal ao fechar
        }
    });
});

// Função para o dropdown de classificação
document.addEventListener('DOMContentLoaded', function() {
    const classificacaoFilter = document.getElementById('classificacao-filter');
    const filterDropdown = classificacaoFilter.querySelector('.filter-dropdown');
    const filtersContainer = document.querySelector('.filters-container'); // Seleciona o container dos filtros

    classificacaoFilter.addEventListener('click', function(event) {
        event.stopPropagation(); // Impede que o evento se propague para o documento

        // Verifica se o dropdown já está visível
        const isVisible = filterDropdown.style.display === 'block';

        // Se estiver visível, esconde; caso contrário, mostra
        filterDropdown.style.display = isVisible ? 'none' : 'block';

        // Adiciona ou remove a classe dropdown-open no filters-container
        if (filterDropdown.style.display === 'block') {
            filtersContainer.classList.add('dropdown-open');
        } else {
            filtersContainer.classList.remove('dropdown-open');
        }
    });

    // Adiciona um evento de clique no documento para fechar o dropdown quando clicar fora
    document.addEventListener('click', function(event) {
        if (filterDropdown.style.display === 'block') {
            filterDropdown.style.display = 'none';
            filtersContainer.classList.remove('dropdown-open'); // Remove a classe ao fechar o dropdown
        }
    });
});

// Função para o formulário de filtros
document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.getElementById('filter-form');

    // CATEGORIAS
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.dataset.category;

            // Cria e adiciona um input oculto para a categoria
            let categoryInput = document.querySelector('input[name="categoria"]');
            if (categoryInput) {
                categoryInput.value = category; // Se já existir, atualiza
            } else {
                categoryInput = document.createElement('input');
                categoryInput.type = 'hidden';
                categoryInput.name = 'categoria';
                categoryInput.value = category;
                filterForm.appendChild(categoryInput);
            }
            filterForm.submit(); // Envia o formulário
        });
    });

    // FILTROS
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault(); // Evita o comportamento padrão do link
            
            const filter = this.dataset.filter;

            // Remove qualquer campo de ordenação existente para substituir
            const existingSortField = document.querySelector('input[name="sort_by"]');
            if (existingSortField) {
                filterForm.removeChild(existingSortField);
            }

            // Cria um campo oculto para sort_by com o valor do filtro clicado
            const sortField = document.createElement('input');
            sortField.type = 'hidden';
            sortField.name = 'sort_by';
            sortField.value = filter;

            filterForm.appendChild(sortField); // Adiciona o campo de ordenação ao formulário
            filterForm.submit(); // Submete o formulário
        });
    });

    const classificacaoOpcoes = document.querySelectorAll('.filter-dropdown a');
    classificacaoOpcoes.forEach(opcao => {
        opcao.addEventListener('click', function(event) {
            event.preventDefault();
            const classificacaoIdade = this.dataset.classificacao_idade;

            // Cria um campo oculto para classificacao_idade e o adiciona ao formulário
            let classificacaoInput = document.querySelector('input[name="classificacao_idade"]');
            if (classificacaoInput) {
                classificacaoInput.value = classificacaoIdade;
            } else {
                classificacaoInput = document.createElement('input');
                classificacaoInput.type = 'hidden';
                classificacaoInput.name = 'classificacao_idade';
                classificacaoInput.value = classificacaoIdade;
                filterForm.appendChild(classificacaoInput);
            }
            filterForm.submit(); // Envia o formulário
        });
    });
});

// Função para o formulário de pesquisa
document.addEventListener('DOMContentLoaded', function() {
    // Envia o formulário ao clicar no ícone da lupa
    document.querySelector('.iconelupa').addEventListener('click', function() {
        document.getElementById('search-form').submit();
    });

    // Envia o formulário ao pressionar "Enter" no campo de pesquisa
    document.getElementById('search-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            document.getElementById('search-form').submit();
        }
    });
});