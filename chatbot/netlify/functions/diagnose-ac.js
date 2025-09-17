const OpenAI = require('openai');

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message } = JSON.parse(event.body);
        
        // Ambil API Key rahasia dari Netlify (bukan ditulis di sini)
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Ini adalah "peran" yang kita berikan kepada AI
        const systemPrompt = `
            Anda adalah seorang teknisi AC virtual yang sangat berpengalaman dan ramah. 
            Tugas Anda adalah membantu pengguna mendiagnosis masalah AC mereka berdasarkan deskripsi singkat.
            Berikan kemungkinan penyebab dan beberapa langkah perbaikan sederhana yang bisa dicoba oleh orang awam.
            Selalu akhiri jawaban dengan saran untuk menghubungi teknisi profesional jika masalah berlanjut dan sertakan pesan promosi seperti "Hubungi [FRION] di [0881010050528] untuk penanganan lebih lanjut."
            Gunakan bahasa Indonesia yang mudah dimengerti. Jangan memberikan jawaban yang terlalu teknis.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Model yang cepat dan hemat biaya
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
        });

        const aiReply = completion.choices[0].message.content;

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
