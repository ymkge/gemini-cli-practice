document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages');
    const character = document.getElementById('character');
    const resetChatButton = document.getElementById('reset-chat-button'); // IDを修正

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (!message) return;

        appendMessage(message, 'user');
        messageInput.value = '';

        await getAiResponse(message);
    });

    // リセットボタンのクリックイベント
    resetChatButton.addEventListener('click', () => {
        if (confirm('会話履歴をリセットしますか？')) {
            messagesContainer.innerHTML = ''; // メッセージを空にする
            character.classList.remove('talking');
            character.classList.add('idle');
            messageInput.disabled = false;
            chatForm.querySelector('button[type="submit"]').disabled = false;
        }
    });

    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        const bubble = document.createElement('div');
        bubble.classList.add('message-bubble');
        bubble.textContent = text;
        
        messageDiv.appendChild(bubble);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return messageDiv;
    }

    async function getAiResponse(message) {
        character.classList.remove('idle');
        character.classList.add('talking');

        const aiMessageDiv = appendMessage('', 'ai');
        const aiBubble = aiMessageDiv.querySelector('.message-bubble');

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            // ストリームを処理
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep the last partial line

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.error) {
                            console.error('AI Error:', parsed.error);
                            aiBubble.textContent = parsed.error;
                            break;
                        }

                        const token = parsed.token;
                        if (token === '[END]') {
                            return; // End of stream
                        }
                        aiBubble.textContent += token;
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    } catch (e) {
                        console.error('Error parsing JSON chunk:', e, 'Chunk:', line);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching AI response:', error);
            aiBubble.textContent = 'An error occurred while fetching the response.';
        } finally {
            // Ensure animation stops
            character.classList.remove('talking');
            character.classList.add('idle');
        }
    }
});