document.addEventListener('DOMContentLoaded', async () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages');
    const resetChatButton = document.getElementById('reset-chat-button');

    // --- Live2D Initialization ---
    const canvas = document.getElementById('live2d-canvas');
    const app = new PIXI.Application({
        view: canvas,
        width: canvas.width,
        height: canvas.height,
        transparent: true,
        autoStart: true,
    });

    // Epsilonモデルのパス
    const modelPath = '/static/live2d_models/Sparkle/Sparkle.model3.json';
    const model = await PIXI.live2d.Live2DModel.from(modelPath);
    app.stage.addChild(model);

    // モデルロード後にモーション情報を確認
    model.on('load', () => {
        console.log('Live2D Model loaded:', model); // モデルがロードされたことを確認
        console.log('Available motions:', model.motions); // 利用可能なモーションを確認

        // 初期アイドルモーションを再生
        if (model.motions && model.motions.Idle) {
            model.motion('Idle', 0);
        }
    });

    model.scale.set(0.1);
    model.x = 0;
    model.y = 0;

    // 視線追従
    model.interactive = true;
    app.stage.on('pointermove', (event) => {
        model.focus(event.global.x, event.global.y);
    });

    // --- Chat Logic ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (!message) return;

        appendMessage(message, 'user');
        messageInput.value = '';

        await getAiResponse(message);
    });

    resetChatButton.addEventListener('click', () => {
        if (confirm('会話履歴をリセットしますか？')) {
            messagesContainer.innerHTML = '';
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
        console.log('Attempting to play motion "Talk"'); // モーション再生を試みることを確認
        if (model.motions && model.motions.Talk) {
            model.motion('Talk', 2); // Talkモーションを再生
        }

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

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

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
                            return;
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
            console.log('Attempting to play motion "Idle"'); // モーション再生を試みることを確認
            if (model.motions && model.motions.Idle) {
                model.motion('Idle', 0);
            }
        }
    }
});