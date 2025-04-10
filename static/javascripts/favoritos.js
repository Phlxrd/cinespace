document.addEventListener('DOMContentLoaded', function() {
    // Seleciona todos os botões que adicionam aos favoritos.  É importante ter uma
    // classe ou atributo em comum, como 'add-to-favorites-btn', nos botões.
    const favoriteButtons = document.querySelectorAll('.add-to-favorites-btn'); // Adicione a classe correta aqui


    favoriteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault(); // Impede o comportamento padrão do link/botão

            // Obtém o ID do conteúdo.  O ideal é que o ID esteja em um atributo data-* do botão.
            const conteudoId = this.dataset.conteudoId;  // Ex: <button data-conteudo-id="123">

            // Obtém o perfilId da sessão (você pode passar isso do seu template Django)
            const perfilId = window.perfilId || null; // Variável global ou de um elemento HTML

            if (!perfilId) {
                alert("Por favor, selecione um perfil antes de adicionar aos favoritos.");
                return;
            }

            if (!conteudoId) {
                alert("Erro: ID do conteúdo não encontrado.");
                return;
            }


            // Faz a requisição AJAX (fetch)
            fetch(`/adicionar_favorito/${conteudoId}/`, {  // Ajuste a URL se necessário
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'), // Função getCookie mais abaixo
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    perfil_id: perfilId,
                   // conteudo_id: conteudoId  // Não precisa mais, a URL já tem
                })
            })
            .then(response => {
                if (!response.ok) {
                    // Trata erros de rede ou respostas não-2xx
                    return response.json().then(data => { throw new Error(data.message || 'Erro na requisição') });
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message || 'Conteúdo adicionado aos favoritos!');
                    // Atualiza a interface, se necessário (ex: mudar ícone do botão)
                    this.classList.add('favorited'); // Adiciona uma classe, por exemplo
                    this.querySelector('img').src = "{% static 'imagens/vectores/Favoritos_added.png' %}"; //Muda o icone

                } else {
                    alert(data.message || 'Erro ao adicionar aos favoritos.');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao adicionar aos favoritos: ' + error.message);
            });
        });
    });


    // Função auxiliar para obter o token CSRF do cookie (necessário para Django)
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
});