const { GoogleGenAI } = require("@google/generative-ai");

// Inisialisasi GoogleGenAI dengan API Key dari environment variable Netlify
// Variabel GOOGLE_API_KEY harus sudah disetel di pengaturan Netlify Anda.
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const model = "gemini-2.5-flash";

exports.handler = async (event) => {
    // Memastikan metode adalah POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    try {
        // Parsing body
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing prompt in request body" }),
            };
        }
        
        // System instruction untuk menyesuaikan persona Frion
        const systemInstruction = `Anda adalah Frion, seorang Asisten AI khusus untuk Diagnosis Kerusakan AC. 
        Jawablah pertanyaan pengguna dengan ramah, profesional, dan fokus pada diagnosis masalah AC. 
        Jika masalah yang dipertanyakan bukan tentang AC atau layanan Anda, berikan tanggapan yang sopan bahwa fokus Anda hanya pada AC. 
        Jawaban harus ringkas dan langsung memberikan 1-3 kemungkinan penyebab dan saran tindakan.`;

        // Panggil Gemini API
        const result = await ai.models.generateContent({
            model: model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
            },
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI gagal menghasilkan respons yang valid.";

        // Mengembalikan respons sukses ke front-end
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            // Menggunakan kunci 'response' agar sesuai dengan script.js (Front-End)
            body: JSON.stringify({ response: text }),
        };

    } catch (error) {
        console.error("Kesalahan dalam Netlify Function:", error.message);

        // Mengembalikan respons error
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: `Kesalahan Internal Server: ${error.message}` }),
        };
    }
};
