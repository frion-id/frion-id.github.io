const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Handler untuk Netlify Function yang menangani permintaan diagnostik AC dari chatbot.
 * Fungsi ini menggunakan Google Gemini API.
 * * @param {object} event - Objek acara dari permintaan HTTP POST.
 * @returns {object} - Objek respons HTTP.
 */
exports.handler = async function (event, context) {
    // Pastikan metode yang digunakan adalah POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Parse pesan yang dikirim dari klien
        const { message } = JSON.parse(event.body);

        // Ambil API Key dari Environment Variable Netlify.
        // Variabel yang dipanggil di sini adalah GEMINI_API_KEY.
        // PASTIKAN ANDA JUGA MENGGANTI NAMA VARIABEL DI NETLIFY MENJADI GEMINI_API_KEY.
        const genAI = new new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // System Prompt untuk mengarahkan perilaku AI
        const systemPrompt = `Anda adalah seorang teknisi AC virtual yang sangat berpengalaman dan ramah bernama 'AI FRION'. Tugas Anda adalah membantu pengguna mendiagnosis masalah AC mereka berdasarkan deskripsi singkat. Berikan kemungkinan penyebab dan beberapa langkah perbaikan sederhana yang bisa dicoba oleh orang awam. Selalu akhiri jawaban dengan saran untuk menghubungi teknisi profesional jika masalah berlanjut dan sertakan pesan promosi seperti "Hubungi FRION di 0881010050528 untuk penanganan lebih lanjut." Gunakan bahasa Indonesia yang mudah dimengerti. Jangan memberikan jawaban yang terlalu teknis.`;
        
        // Konfigurasi model Gemini
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash-latest", // Menggunakan model terbaru untuk performa cepat
            systemInstruction: systemPrompt // Menggunakan systemInstruction untuk instruksi peran
        });

        // Memulai obrolan (chat)
        const chat = model.startChat({});
        
        // Mengirim pesan pengguna ke model
        const result = await chat.sendMessage(message);
        const aiReply = result.response.text;

        // Kirim balasan AI kembali ke klien
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiReply }),
        };

    } catch (error) {
        // Tangani jika ada error dalam proses (misalnya API Key salah atau masalah jaringan)
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Terjadi kesalahan pada server. Cek log Netlify untuk detail API Key.' }),
        };
    }
};
