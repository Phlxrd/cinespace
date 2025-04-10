// Função para alternar a sidebar (recolher/expandir)
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('sidebar-collapsed');
}

// Evento de clique no título da sidebar
document.querySelector('.sidebar-title').addEventListener('click', toggleSidebar);

// Evento de clique em QUALQUER ícone do menu
document.querySelectorAll('.menu-icon').forEach(icon => {
    icon.addEventListener('click', toggleSidebar);
});

// Evento de clique no ícone de menu (Mobile)
document.getElementById('mobileMenuIcon').addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
});

// Função para obter o valor de um cookie (necessário para CSRF com Django)
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

function addMessage(sender, message, isUser = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');

    if (isUser) {
        messageContainer.classList.add('user-message');
    } else {
        messageContainer.classList.add('bot-message');
    }

    try {
        messageContainer.innerHTML = `
            <div class="message-content">
                ${marked.parse(message)}
            </div>
        `;
        highlightCodeBlocks(messageContainer);
    } catch (error) {
        console.error("Erro ao adicionar mensagem:", error);
        messageContainer.innerHTML = `
            <div class="message-content">
                ${message.replace(/</g, '<').replace(/>/g, '>')}
            </div>
        `;
    }

    chatMessages.appendChild(messageContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatUserInput(userInput) {
    return marked.parseInline(userInput); // Use parseInline para formatação em linha
}

function sendMessage(userInput, hideElements = true) {
    if (!userInput) {
        return;
    }

    console.log("Enviando comando:", userInput);  // Log do comando enviado

    if (hideElements) {
        const blocks = document.querySelector('.blocks');
        const contentTitle = document.querySelector('.content-title');
        if (blocks) {
            blocks.style.display = 'none';
        }
        if (contentTitle) {
            contentTitle.style.display = 'none';
        }
    }

    addMessage('Você', userInput, true);

    document.getElementById('loading-indicator').style.display = 'flex';

    fetch('/processar-comando/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ comando: userInput })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Resposta do backend:", data);  // Log da resposta do backend
            document.getElementById('loading-indicator').style.display = 'none';

            if (data.resposta) {
                typeMessage('Scabello', data.resposta);
            } else if (data.error) {
                addMessage('Scabello', `Erro: ${data.error} - ${data.detail || 'Detalhes não disponíveis'}`);
            } else {
                addMessage('Scabello', 'Desculpe, ocorreu um erro desconhecido.');
            }
        })
        .catch(error => {
            console.error('Erro ao enviar mensagem:', error);
            document.getElementById('loading-indicator').style.display = 'none';
            addMessage('Scabello', 'Desculpe, ocorreu um erro ao processar sua pergunta.');
        });

    document.getElementById('userInput').value = '';

    const prompt = `
    ${userInput}
    
    Formate sua resposta usando Markdown. Se você incluir código, use blocos de código com crases (\`\`\`) e especifique a linguagem de programação (por exemplo, \`\`\`python).  Exemplo:
    
    \`\`\`python
    def minha_funcao():
        print("Olá, mundo!")
    \`\`\`
    `;
    
        fetch(`/enviar-mensagem/${chatId}/`, { // Use a rota enviar-mensagem!
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ comando: prompt, chatId: chatId }) // Envie o prompt modificado, e o chatId
        })
}

// --- Configuração dos blocos de comando ---

function setupBlockCommands() {
    const blockCommands = {
        "Criar fotos": "A funcionalidade de criação de imagens estará disponível em breve!",
        "Criar textos": "Crie um texto",
        "Conversar": "Vamos conversar",
        "Agendar": "Agende um compromisso"
    };

    document.querySelectorAll('.block').forEach(block => {
        block.addEventListener('click', () => {
            const blockText = block.querySelector('.block-text').textContent;
            const command = blockCommands[blockText] || blockText; // Usa o comando mapeado ou o texto do bloco
            sendMessage(command); // Chama sendMessage com o comando (hideElements é true por padrão)
        });
    });
}

function typeMessage(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', 'bot-message');
    messageContainer.innerHTML = '<div class="message-content"></div>';
    chatMessages.appendChild(messageContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const messageContent = messageContainer.querySelector('.message-content');
    let index = 0;
    let currentText = '';

    function typeChar() {
        if (index < message.length) {
            currentText += message.charAt(index);
            index++;

            try {
                let formattedText = marked.parse(currentText);
                messageContent.innerHTML = formattedText;
                highlightCodeBlocks(messageContent); // Realça blocos de código
            } catch (error) {
                console.error("Erro ao formatar mensagem:", error);
                messageContent.innerHTML = currentText.replace(/</g, '<').replace(/>/g, '>'); // Exibe texto bruto com escape
            }

            setTimeout(typeChar, 0.5); // Diminui o tempo para o efeito ser mais rapido
        }
    }
    typeChar();
}

function highlightCodeBlocks(element) {
    const codeBlocks = element.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        try {
            const language = franc(block.textContent);  // Detecta a linguagem
            const detectedLanguage = language && hljs.getLanguage(language) ? language : 'plaintext'; // Usa plaintext se não detectou

            hljs.highlightBlock(block);  // Aplica o highlight

            block.className = `language-${detectedLanguage}`;

            // --- Cria a nova estrutura HTML ---
            const container = document.createElement('div');
            container.classList.add('code-block-container');

            const header = document.createElement('div');
            header.classList.add('code-block-header');

            const languageSpan = document.createElement('span');
            languageSpan.textContent = detectedLanguage.toUpperCase(); // Nome da linguagem em maiúsculas
            header.appendChild(languageSpan);

            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copiar';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(block.textContent);
                copyButton.textContent = 'Copiado!';
                setTimeout(() => { copyButton.textContent = 'Copiar'; }, 2000);
            });
            header.appendChild(copyButton);

            container.appendChild(header);

            // Move o bloco <pre><code> para dentro do container
            const preElement = block.parentNode; // Pega o <pre>
            container.appendChild(preElement);

            // Insere o container no lugar do <pre> original
            element.replaceChild(container, preElement);



        } catch (error) {
            console.error("Erro ao realçar bloco de código:", error);
            block.className = 'language-plaintext'; // Fallback
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    carregarChats(); // Carrega os chats ao abrir a página
    setupBlockCommands();

    // Event listeners para enviar mensagem
    document.getElementById('sendButton').addEventListener('click', () => {
        sendMessage(document.getElementById('userInput').value);
    });
    document.getElementById('userInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(document.getElementById('userInput').value);
        }
    });

    const userInput = document.getElementById('userInput');
    const messageBar = document.querySelector('.message-bar');
    const maxHeight = 150; // Defina a altura máxima desejada (em pixels)

    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto'; // Resetar a altura para recalcular
        let newHeight = userInput.scrollHeight; // Altura do conteúdo do textarea

        // Limitar a altura máxima do textarea
        if (newHeight > maxHeight - 24) { // Subtrair o padding da barra de mensagens
            newHeight = maxHeight - 24;
            userInput.style.overflowY = 'auto'; // Adicionar barra de rolagem se exceder a altura máxima
        } else {
            userInput.style.overflowY = 'hidden'; // Remover barra de rolagem se não exceder a altura máxima
        }

        userInput.style.height = newHeight + 'px'; // Ajustar a altura do textarea
        messageBar.style.height = newHeight + 24 + 'px'; // Ajustar a altura da barra de mensagens

        // Se a altura voltar ao normal, restaura a altura da barra de mensagens
        if (userInput.scrollHeight <= 20) {
            messageBar.style.height = '40px';
        }
    });
});


let mediaRecorder;
let audioChunks = [];

document.getElementById('micButton').addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    } else {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = [];
                    sendAudio(audioBlob);
                };
                mediaRecorder.start();
            });
    }
});

function sendAudio(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    fetch('/processar-audio/', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.audio_response) {
            const audio = new Audio(`data:audio/wav;base64,${data.audio_response}`);
            audio.play();
        }
    });
}


function carregarMensagens() {
    fetch('/carregar-mensagens/')
        .then(response => response.json())
        .then(data => {
            if (data.mensagens) {
                data.mensagens.reverse().forEach(msg => {
                    addMessage(msg.sender, msg.message, msg.is_user);
                });
            }
        })
        .catch(error => {
            console.error('Erro ao carregar mensagens:', error);
        });
}
function carregarChats() {
    fetch('/listar-chats/')
        .then(response => response.json())
        .then(data => {
            const chatList = document.getElementById('chat-list');
            chatList.innerHTML = ''; // Limpa a lista de chats

            if (data.chats && data.chats.length > 0) {
                data.chats.forEach(chat => {
                    const chatItem = document.createElement('div');
                    chatItem.classList.add('chat-item'); // Aplica a classe comum
                    chatItem.innerHTML = `
                        <img src="{% static 'imagens/icones/chat-icon.png' %}" alt="Ícone Chat" class="chat-icon">
                        <span class="chat-nome">${chat.nome}</span>
                        <span class="chat-id" style="display: none;">${chat.id}</span>
                    `;
                    chatItem.addEventListener('click', () => {
                        carregarMensagens(chat.id); // Carrega as mensagens do chat selecionado
                    });
                    chatList.appendChild(chatItem);
                });
            } else {
                chatList.innerHTML = '<p>Nenhum chat encontrado.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao carregar chats:', error);
        });
}

function carregarMensagens(chatId) {
    fetch(`/carregar-mensagens/${chatId}/`)
        .then(response => response.json())
        .then(data => {
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.innerHTML = ''; // Limpa as mensagens atuais

            if (data.mensagens) {
                data.mensagens.forEach(msg => {
                    addMessage(msg.sender, msg.texto, msg.is_user);
                });
            }
        })
        .catch(error => {
            console.error('Erro ao carregar mensagens:', error);
        });
}


document.getElementById('criar-chat').addEventListener('click', () => {
    const primeiraMensagem = prompt("Digite a primeira mensagem para o novo chat:");
    if (primeiraMensagem) {
        fetch('/criar-chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ primeira_mensagem: primeiraMensagem })
        })
            .then(response => response.json())
            .then(data => {
                if (data.chat_id) {
                    carregarChats(); // Recarrega a lista de chats
                    carregarMensagens(data.chat_id); // Carrega as mensagens do novo chat
                }
            })
            .catch(error => {
                console.error('Erro ao criar chat:', error);
            });
    }
});

function atualizarNomeChat(chatId, novaMensagem) {
    fetch(`/atualizar-nome-chat/${chatId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ nova_mensagem: novaMensagem })
    })
        .then(response => response.json())
        .then(data => {
            if (data.nome) {
                carregarChats(); // Recarrega a lista de chats para refletir o novo nome
            }
        })
        .catch(error => {
            console.error('Erro ao atualizar nome do chat:', error);
        });
}