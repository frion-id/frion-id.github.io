const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function (event, context) {
    // Hanya izinkan metode POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Ambil pesan dari body request yang dikirim frontend
        const { message } = JSON.parse(event.body);

        // Ambil API Key dari environment variables di Netlify
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        // Definisikan peran dan instruksi untuk AI
        const systemPrompt = `Anda adalah seorang teknisi AC virtual yang sangat berpengalaman dan ramah bernama 'AI FRION'. Tugas Anda adalah membantu pengguna mendiagnosis masalah AC mereka berdasarkan deskripsi singkat. Berikan kemungkinan penyebab dan beberapa langkah perbaikan sederhana yang bisa dicoba oleh orang awam. Selalu akhiri jawaban dengan saran untuk menghubungi teknisi profesional jika masalah berlanjut dan sertakan pesan promosi seperti "Hubungi FRION di 0881010050528 untuk penanganan lebih lanjut." Gunakan bahasa Indonesia yang mudah dimengerti. Jangan memberikan jawaban yang terlalu teknis.`;
        
        // --- PERUBAHAN DIMULAI DI SINI ---

        // Inisialisasi model dengan instruksi sistem (cara yang direkomendasikan)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash-latest", // PERBAIKAN 1: Menambahkan "-latest"
            systemInstruction: systemPrompt     // PERBAIKAN 2: Menggunakan "systemInstruction"
        });

        // Mulai percakapan dengan riwayat kosong
        const chat = model.startChat({
            history: [] // PERBAIKAN 3: Mengosongkan riwayat awal
        });

        // --- AKHIR DARI PERUBAHAN ---

        // Kirim pesan pengguna ke AI
        const result = await chat.sendMessage(message);
        const aiReply = result.response.text();

        // Kembalikan jawaban dari AI ke frontend
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: aiReply }),
        };

    } catch (error) {
        // Tangani jika terjadi error
        console.error("Error:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: 'Terjadi kesalahan pada server.' }),
        };
    }
};
