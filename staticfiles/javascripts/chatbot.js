document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const iaIcon = document.getElementById('I.A-icon');
    const closeChat = document.getElementById('close-chat');
    const sendButton = document.getElementById('sendButton');
    const sendIcon = document.getElementById('sendIcon');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chat-messages');
    const chatTexts = document.querySelector('.chat-texts');
    const loadingIndicator = document.getElementById('loading-indicator');
    const newChatBtn = document.querySelector('.new-chat-btn'); // Botão existente no HTML
    
    const CHAT_HISTORY_KEY = 'cinespace_chat_history';
    const MAX_HISTORY_ITEMS = 10;
    
    let isSending = false;
    let isTyping = false;
    let abortController = null;
    let typingTimeout = null;

    // Funções auxiliares
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

    function openChat() {
        chatWindow.style.display = 'block';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.classList.add('chat-active');
    }

    function closeChatWindow() {
        chatWindow.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        document.body.classList.remove('chat-active');
    }

    function resetChat() {
        chatMessages.innerHTML = '';
        if (chatTexts) {
            chatTexts.style.display = 'block';
        }
        userInput.value = '';
    }

    function addMessage(sender, message, isUser = false) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message');

        if (isUser) {
            messageContainer.classList.add('user-message');
            messageContainer.innerHTML = `<div class="message-content user">${message}</div>`;
        } else {
            messageContainer.classList.add('bot-message');
            messageContainer.innerHTML = `
                <div class="message-content bot">
                    <img src="https://i.postimg.cc/HL4gjJ3g/conversarvec-1.png" alt="Ícone do Bot" class="bot-icon">
                    <div class="message-text">${formatMessage(message)}</div>
                </div>
            `;
        }

        chatMessages.appendChild(messageContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (chatTexts && chatTexts.style.display !== 'none') {
            chatTexts.style.display = 'none';
        }
    }

    function typeMessage(sender, message) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message', 'bot-message');
        messageContainer.innerHTML = `
            <div class="message-content bot">
                <img src="https://i.postimg.cc/HL4gjJ3g/conversarvec-1.png" alt="Ícone do Bot" class="bot-icon">
                <div class="message-text"></div>
            </div>
        `;
        chatMessages.appendChild(messageContainer);

        const messageText = messageContainer.querySelector('.message-text');
        let index = 0;
        let currentText = '';
        isTyping = true;

        function typeChar() {
            if (index < message.length && isTyping) {
                currentText += message.charAt(index);
                index++;
                messageText.innerHTML = formatMessage(currentText);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                typingTimeout = setTimeout(typeChar, 1);
            } else {
                finishTyping();
            }
        }

        function finishTyping() {
            isTyping = false;
            isSending = false;
            clearTimeout(typingTimeout);
            sendIcon.src = 'https://i.postimg.cc/pLvhrpyq/botao-enviar.png';
            sendButton.disabled = false;
        }

        typeChar();
    }

    function formatMessage(message) {
        message = message.replace(/\n/g, '<br>');
        message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        message = message.replace(/\*(.*?)\*/g, '<em>$1</em>');
        message = message.replace(/-\s(.*?)(<br>|$)/g, '<li>$1</li>');
        if (message.includes('<li>')) {
            message = `<ul>${message}</ul>`;
        }
        return message;
    }

    function saveChatHistory(messages) {
        try {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-MAX_HISTORY_ITEMS)));
        } catch (e) {
            console.error('Erro ao salvar histórico:', e);
        }
    }

    function loadChatHistory() {
        try {
            const history = localStorage.getItem(CHAT_HISTORY_KEY);
            return history ? JSON.parse(history) : [];
        } catch (e) {
            console.error('Erro ao carregar histórico:', e);
            return [];
        }
    }

    function sendMessage(userInput) {
        if (!userInput) return;

        const chatHistory = loadChatHistory();
        chatHistory.push({
            sender: 'user',
            content: userInput,
            timestamp: new Date().toISOString()
        });

        addMessage('Você', userInput, true);
        document.getElementById('userInput').value = '';
        document.getElementById('userInput').style.height = '40px';
        document.getElementById('userInput').focus();

        sendIcon.src = 'https://i.postimg.cc/bv2PkRGP/forma-quadrada-preta-arredondada.png';
        isSending = true;
        sendButton.disabled = true;

        loadingIndicator.style.display = 'flex';
        abortController = new AbortController();

        const contextMessages = chatHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));

        fetch('/processar-comando/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ 
                comando: userInput,
                contexto: contextMessages.slice(-5)
            }),
            signal: abortController.signal
        })
        .then(response => response.json())
        .then(data => {
            loadingIndicator.style.display = 'none';

            if (data.resposta) {
                chatHistory.push({
                    sender: 'bot',
                    content: data.resposta,
                    timestamp: new Date().toISOString()
                });
                saveChatHistory(chatHistory);
                typeMessage('Space Bot', data.resposta);
            } else {
                addMessage('Space Bot', data.error || 'Desculpe, ocorreu um erro desconhecido.');
                isSending = false;
                sendIcon.src = 'https://i.postimg.cc/pLvhrpyq/botao-enviar.png';
                sendButton.disabled = false;
            }
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            if (error.name !== 'AbortError') {
                console.error('Erro:', error);
                addMessage('Space Bot', 'Erro ao processar sua pergunta.');
            }
            isSending = false;
            sendIcon.src = 'https://i.postimg.cc/pLvhrpyq/botao-enviar.png';
            sendButton.disabled = false;
        });
    }

    // Inicialização
    const history = loadChatHistory();
    if (history.length > 0) {
        history.forEach(msg => {
            if (msg.sender === 'user') {
                addMessage('Você', msg.content, true);
            } else {
                addMessage('Space Bot', msg.content);
            }
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Configura o botão "Novo Chat" existente no HTML
    if (newChatBtn) {
        newChatBtn.onclick = () => {
            localStorage.removeItem(CHAT_HISTORY_KEY);
            resetChat();
        };
    }

    // Event listeners
    closeChat.addEventListener('click', closeChatWindow);
    iaIcon.addEventListener('click', (e) => {
        e.preventDefault();
        openChat();
    });

    sendButton.addEventListener('click', () => {
        if (isSending || isTyping) {
            if (abortController) {
                abortController.abort();
            }
            isTyping = false;
            isSending = false;
            sendIcon.src = 'https://i.postimg.cc/pLvhrpyq/botao-enviar.png';
            sendButton.disabled = false;
        } else {
            sendMessage(userInput.value);
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isSending) {
                sendMessage(userInput.value);
            }
        }
    });

    function adjustTextareaHeight() {
        if (userInput.value.trim() === '') {
            userInput.style.height = '40px';
        } else {
            userInput.style.height = 'auto';
            userInput.style.height = `${Math.min(userInput.scrollHeight, 150)}px`;
        }
    }

    userInput.addEventListener('input', adjustTextareaHeight);
    adjustTextareaHeight();
});