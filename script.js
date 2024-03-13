document.getElementById('chat-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const userInputField = document.getElementById('user-input');
    const sendButton = this.querySelector('button[type="submit"]');
    const userInput = userInputField.value;
    if (!userInput.trim()) return; // Skip empty inputs

    const chatBox = document.getElementById('chat-box');
    
    const userDiv = document.createElement('div');
    userDiv.classList.add('user-message');
    userDiv.textContent = `You: ${userInput}`;
    chatBox.appendChild(userDiv);

    chatBox.scrollTop = chatBox.scrollHeight;

    const placeholderDiv = document.createElement('div');
    placeholderDiv.classList.add('loading-placeholder');
    chatBox.appendChild(placeholderDiv);

    const loadingIndicator = document.getElementById('loading-indicator').cloneNode(true);
    loadingIndicator.style.display = 'block';
    placeholderDiv.appendChild(loadingIndicator);

    userInputField.disabled = true;
    sendButton.disabled = true;

    userInputField.value = '';

    // Updated part: Get or initialize threadID from sessionStorage
    let sessionData = sessionStorage.getItem('sessionData');
    let threadID = null;
    if (sessionData) {
        threadID = JSON.parse(sessionData).threadID;
    }

    fetch('https://us-central1-cbbbot-413503.cloudfunctions.net/barrysnipesv3', {
        method: 'OPTIONS',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (response.ok) {
            return fetch('https://us-central1-cbbbot-413503.cloudfunctions.net/barrysnipesv3', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: userInput, thread_id: threadID })
            });
        } else {
            throw new Error('Failed to fetch');
        }
    })
    .then(response => response.json())
    .then(data => {
        placeholderDiv.remove();

        // Store or update threadID in sessionStorage
        if (data.thread_id) {
            sessionStorage.setItem('sessionData', JSON.stringify({threadID: data.thread_id}));
        }

        data.messages.forEach((message) => {
            const responseDiv = document.createElement('div');
            responseDiv.classList.add('assistant-response');
            responseDiv.innerHTML = message;
            chatBox.appendChild(responseDiv);
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch((error) => {
        console.error('Error:', error);
        placeholderDiv.remove();
    })
    .finally(() => {
        userInputField.disabled = false;
        sendButton.disabled = false;
    });
});

//Adding for mobile as test//
document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default action to stop from any unexpected behavior
        document.getElementById('chat-form').submit(); // Trigger the form submission
    }
});
