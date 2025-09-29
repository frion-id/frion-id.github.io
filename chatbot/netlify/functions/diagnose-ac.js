const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message } = JSON.parse(event.body);

        // Ambil API Key rahasia dari Netlify
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        // Ini adalah "peran" yang kita berikan kepada AI
        const systemPrompt = `Anda adalah seorang teknisi AC virtual yang sangat berpengalaman dan ramah bernama 'AI FRION'. Tugas Anda adalah membantu pengguna mendiagnosis masalah AC mereka berdasarkan deskripsi singkat. Berikan kemungkinan penyebab dan beberapa langkah perbaikan sederhana yang bisa dicoba oleh orang awam. Selalu akhiri jawaban dengan saran untuk menghubungi teknisi profesional jika masalah berlanjut dan sertakan pesan promosi seperti "Hubungi FRION di 0881010050528 untuk penanganan lebih lanjut." Gunakan bahasa Indonesia yang mudah dimengerti. Jangan memberikan jawaban yang terlalu teknis.`;
        
        // --- PERUBAHAN DIMULAI DI SINI ---

        // PERBAIKAN 1: Ganti model ke 'gemini-1.5-flash-latest' yang lebih baru dan gratis.
        // PERBAIKAN 2: Gunakan 'systemInstruction' untuk cara pemberian perintah yang lebih modern dan stabil.
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash-latest",
            systemInstruction: systemPrompt 
        });

        // Hapus 'history' karena perintah sistem sudah diberikan di atas
        const chat = model.startChat({
            history: [],
        });
        
        // --- AKHIR DARI PERUBAHAN ---

        const result = await chat.sendMessage(message);
        const aiReply = result.response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiReply }),
        };

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Terjadi kesalahan pada server.' }),
        };
    }
};
