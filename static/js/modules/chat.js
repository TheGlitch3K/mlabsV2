export function initChat() {
    document.getElementById('ai-chat-icon').addEventListener('click', toggleChatPanel);
    document.getElementById('close-chat').addEventListener('click', toggleChatPanel);
    document.getElementById('maximize-chat').addEventListener('click', maximizeChatPanel);
    document.getElementById('send-message').addEventListener('click', sendChatMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

function toggleChatPanel() {
    const chatPanel = document.getElementById('ai-chat-panel');
    chatPanel.classList.toggle('open');
}

function maximizeChatPanel() {
    const chatPanel = document.getElementById('ai-chat-panel');
    chatPanel.classList.toggle('maximized');
}

function sendChatMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (message) {
        appendChatMessage('User', message);
        input.value = '';
        fetch('/api/ai_chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                message: message,
                chartContext: {
                    symbol: window.currentSymbol,
                    timeframe: window.currentTimeframe,
                    price: window.chartFunctions.getLastPrice(),
                    indicators: getActiveIndicators()
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.response) {
                appendChatMessage('AI', data.response);
            } else {
                appendChatMessage('AI', 'Error: Unable to get a response.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            appendChatMessage('AI', 'Error: Unable to get a response.');
        });
    }
}

function appendChatMessage(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender.toLowerCase()}-message`;
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getActiveIndicators() {
    // Implement this function to return active indicators
    return [];
}
