document.getElementById('chat-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const userInputField = document.getElementById('user-input');
    // Assuming the send button is the only button in your form,
    // you can select it like this:
    const sendButton = this.querySelector('button[type="submit"]');
    const userInput = userInputField.value;
    if (!userInput.trim()) return; // Skip empty inputs

    const chatBox = document.getElementById('chat-box');
    
    // Display user's question
    const userDiv = document.createElement('div');
    userDiv.classList.add('user-message'); // Keep the class for user messages
    userDiv.textContent = `You: ${userInput}`;
    chatBox.appendChild(userDiv);

    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the latest message

    const placeholderDiv = document.createElement('div');
    placeholderDiv.classList.add('loading-placeholder');
    chatBox.appendChild(placeholderDiv);

    const loadingIndicator = document.getElementById('loading-indicator').cloneNode(true);
    loadingIndicator.style.display = 'block'; // Make it visible
    placeholderDiv.appendChild(loadingIndicator);

    // Deactivate the user input box and the send button
    userInputField.disabled = true;
    sendButton.disabled = true;

    // Clear input right after sending
    userInputField.value = '';

    const threadID = localStorage.getItem('threadID');

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

        if (data.thread_id) {
            localStorage.setItem('threadID', data.thread_id);
        }

        // Display the assistant's response(s)
        data.messages.forEach((message) => {
            const responseDiv = document.createElement('div');
            responseDiv.classList.add('assistant-response'); // Keep the class for assistant responses
            responseDiv.innerHTML = message;
            chatBox.appendChild(responseDiv);
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch((error) => {
        console.error('Error:', error);
        placeholderDiv.remove(); // Ensure to remove the placeholder even if an error occurs
    })
    .finally(() => {
        // Re-enable the user input box and the send button
        userInputField.disabled = false;
        sendButton.disabled = false;
    });
});
