/**
 * Netlify Function untuk menangani permintaan diagnosis AC menggunakan Gemini API.
 * File: chatbot/netlify/functions/diagnose-ac.js
 * * KRITIS: Menggunakan sintaks ES Module (import/export) untuk mengatasi 
 * TypeError yang disebabkan oleh ketidakcocokan CommonJS di Node.js Netlify.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inisialisasi GoogleGenerativeAI dengan API Key dari environment variable Netlify
const ai = new GoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });
const model = "gemini-2.5-flash"; 

const handler = async (event) => {
    // Memastikan metode adalah POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    try {
        // Parsing body. Kunci yang diharapkan adalah 'prompt' (diselaraskan dengan script.js)
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing prompt in request body" }),
            };
        }
        
        // System instruction untuk menyesuaikan persona Frion dan Call-to-Action (CTA)
        const systemInstruction = `Anda adalah Asisten AI bernama Frion, seorang teknisi AC profesional, ramah, dan sangat berpengalaman. Tugas Anda adalah:
1. Mendiagnosis masalah AC (Pendingin Udara) yang dijelaskan oleh pengguna.
2. Memberikan jawaban yang ringkas, mudah dipahami, dan profesional.
3. Selalu mengakhiri setiap balasan Anda dengan ajakan bertindak (Call-to-Action) yang mengarahkan pengguna untuk memesan layanan perbaikan atau perawatan dari perusahaan jasa AC Anda.
4. Contoh CTA: "Kami siap membantu! Segera hubungi tim teknisi profesional Frion di 0812-XXXX-XXXX untuk mendapatkan solusi cepat dan terjamin."
5. Jangan pernah menjawab pertanyaan di luar diagnosis AC.`;

        // Panggil Gemini API
        const result = await ai.models.generateContent({
            model: model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
            },
        });

        // Ekstraksi teks respons yang aman
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI gagal menghasilkan respons yang valid.";

        // Mengembalikan respons sukses ke front-end
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            // Menggunakan kunci 'response' agar sesuai dengan script.js (Front-End)
            body: JSON.stringify({ response: text }),
        };

    } catch (error) {
        // Log error secara detail di konsol Netlify
        console.error("Kesalahan dalam Netlify Function:", error.message, error.stack);

        // Mengembalikan respons error ke front-end
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ response: "Maaf, terjadi kesalahan. Coba jelaskan masalah AC Anda lagi." }),
        };
    }
};

export { handler };
