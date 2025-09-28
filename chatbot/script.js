const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Fungsi untuk menambahkan pesan ke tampilan chat
function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    const p = document.createElement('p');
    p.innerText = message;
    messageElement.appendChild(p);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll ke bawah
}

// Fungsi utama untuk mengirim pesan
async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage === '') return;

    addMessage(userMessage, 'user');
    userInput.value = '';

    // Tampilkan pesan loading
    addMessage('AI sedang berpikir...', 'ai');

    try {
        // Mengirim pertanyaan ke "kurir aman" kita
        const response = await fetch('/api/diagnose-ac', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });

        if (!response.ok) {
            throw new Error('Gagal mendapatkan respon dari AI.');
        }

        const data = await response.json();
        const aiResponse = data.reply;

        // Hapus pesan loading dan ganti dengan jawaban AI
        chatBox.removeChild(chatBox.lastChild);
        addMessage(aiResponse, 'ai');

    } catch (error) {
        console.error(error);
        // Hapus pesan loading dan tampilkan pesan error
        chatBox.removeChild(chatBox.lastChild);
        addMessage('Maaf, terjadi kesalahan. Coba lagi nanti.', 'ai');
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
