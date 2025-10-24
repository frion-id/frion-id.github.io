const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Handler untuk Netlify Function yang menangani permintaan diagnostik AC dari chatbot.
 * Fungsi ini menggunakan Google Gemini API.
 */
exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message } = JSON.parse(event.body);

        // Ambil API Key dari Environment Variable Netlify.
        // PENTING: Menggunakan GOOGLE_API_KEY agar sinkron dengan konfigurasi Netlify
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); 
        
        const systemPrompt = `Anda adalah seorang teknisi AC virtual yang sangat berpengalaman dan ramah bernama 'AI FRION'. Tugas Anda adalah membantu pengguna mendiagnosis masalah AC mereka berdasarkan deskripsi singkat. Berikan kemungkinan penyebab dan beberapa langkah perbaikan sederhana yang bisa dicoba oleh orang awam. Selalu akhiri jawaban dengan saran untuk menghubungi teknisi profesional jika masalah berlanjut dan sertakan pesan promosi seperti "Hubungi FRION di 0881010050528 untuk penanganan lebih lanjut." Gunakan bahasa Indonesia yang mudah dimengerti. Jangan memberikan jawaban yang terlalu teknis.`;
        
        // Menggunakan model 2.5-flash yang sangat stabil untuk produksi
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt 
        });

        // Memulai obrolan
        const chat = model.startChat({});
        
        const result = await chat.sendMessage(message);
        const aiReply = result.response.text;

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiReply }),
        };

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Terjadi kesalahan pada server. (Gagal dalam komunikasi dengan AI.)' }),
        };
    }
};
