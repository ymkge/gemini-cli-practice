document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatLog = document.getElementById('chat-log');
    const languageSelector = document.getElementById('language');
    const characterImage = document.getElementById('character-image');
    const endConversationButton = document.getElementById('end-conversation-button');
    const shutdownButton = document.getElementById('shutdown-button');

    // --- Action on response ---
    function triggerCharacterAction() {
        characterImage.classList.add('tilting');
        setTimeout(() => {
            characterImage.classList.remove('tilting');
        }, 500); // Action lasts for 0.5s
    }

    // --- Send message on button click ---
    sendButton.addEventListener('click', sendMessage);

    // --- Send message on Enter key press ---
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // --- End conversation button click ---
    endConversationButton.addEventListener('click', () => {
        chatLog.innerHTML = ''; // Clear chat log
        appendMessage('会話が終了しました。新しい会話を始めましょう！', 'system-message');
    });

    async function sendMessage() {
        const message = userInput.value.trim();
        const selectedLanguage = languageSelector.value;

        if (message === '') return;

        appendMessage(message, 'user-message');
        userInput.value = '';

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    language: selectedLanguage
                }),
            });

            if (!response.ok) {
                // Try to get a more specific error from the server
                const errorData = await response.json();
                throw new Error(errorData.reply || 'Network response was not ok');
            }

            const data = await response.json();
            appendMessage(data.reply, 'character-message');
            triggerCharacterAction(); // Trigger animation on successful reply

        } catch (error) {
            console.error('Error:', error);
            appendMessage(error.message || 'Sorry, something went wrong.', 'character-message');
        }
    }

    function appendMessage(message, className) {
        const messageElement = document.createElement('div');
        messageElement.className = className;
        messageElement.innerText = message;
        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight; // Scroll to the bottom
    }

    // --- Spontaneous message from character ---
    let spontaneousMessageTimeoutId;

    function scheduleSpontaneousMessage() {
        const minMinutes = 3;
        const maxMinutes = 10;
        const randomDelay = Math.floor(Math.random() * ((maxMinutes * 60 * 1000) - (minMinutes * 60 * 1000) + 1)) + (minMinutes * 60 * 1000);

        spontaneousMessageTimeoutId = setTimeout(() => {
            const greetings = {
                'Japanese': [
                    '元気？',
                    '何してるの？',
                    'お話ししよう！',
                    '何か面白いことあった？',
                    '今日の気分はどう？',
                    '何か困ってることない？',
                    '最近どう？',
                    '暇してる？',
                    '何か話したいことある？',
                    '調子はどう？'
                ],
                'English': [
                    'How are you?',
                    'What are you doing?',
                    'Let\'s talk!',
                    'Anything interesting happen lately?',
                    'How are you feeling today?',
                    'Is there anything bothering you?',
                    'How\'s it going?',
                    'Are you bored?',
                    'Do you want to talk about anything?',
                    'How\'s your day going?'
                ]
            };
            const lang = languageSelector.value;
            const randomGreeting = greetings[lang][Math.floor(Math.random() * greetings[lang].length)];
            appendMessage(randomGreeting, 'character-message');
            scheduleSpontaneousMessage(); // Schedule the next message
        }, randomDelay);
    }

    scheduleSpontaneousMessage(); // Start the first spontaneous message

    // --- Shutdown button click --- (Moved to after setInterval definition)
    shutdownButton.addEventListener('click', async () => {
        if (confirm('本当にアプリを終了しますか？')) {
            try {
                await fetch('/shutdown', { method: 'POST' });
                appendMessage('アプリが終了しました。ブラウザのタブを閉じてください。', 'system-message');
                userInput.disabled = true;
                sendButton.disabled = true;
                endConversationButton.disabled = true;
                shutdownButton.disabled = true;
                clearTimeout(spontaneousMessageTimeoutId); // Stop spontaneous messages
            } catch (error) {
                console.error('Error shutting down:', error);
                appendMessage('アプリの終了に失敗しました。', 'system-message');
            }
        }
    });
});
