const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    // Memastikan request adalah POST dan body ada
    if (event.httpMethod !== "POST" || !event.body) {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Metode tidak diizinkan atau body kosong" }),
        };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Prompt tidak boleh kosong." }),
            };
        }

        // Variabel Lingkungan sudah disinkronkan ke GOOGLE_API_KEY
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            // Ini akan muncul jika Kunci API di Netlify Dashboard kosong atau salah nama
            console.error("API Key is missing or incorrectly named.");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Kesalahan server: Kunci API AI tidak ditemukan." }),
            };
        }

        const ai = new GoogleGenerativeAI(apiKey);

        // System Instruction yang disesuaikan untuk bisnis Frion
        const systemInstruction = `Anda adalah Asisten AI bernama Frion, seorang teknisi AC profesional, ramah, dan sangat berpengalaman. Tugas Anda adalah:
1. Mendiagnosis masalah AC (Pendingin Udara) yang dijelaskan oleh pengguna.
2. Memberikan jawaban yang ringkas, mudah dipahami, dan profesional.
3. Selalu mengakhiri setiap balasan Anda dengan ajakan bertindak (Call-to-Action) yang mengarahkan pengguna untuk memesan layanan perbaikan atau perawatan dari perusahaan jasa AC Anda.
4. Contoh CTA: "Kami siap membantu! Segera hubungi tim teknisi profesional Frion di 0812-XXXX-XXXX untuk mendapatkan solusi cepat dan terjamin."
5. Jangan pernah menjawab pertanyaan di luar diagnosis AC.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Menggunakan model stabil
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
            },
        });

        // --- Perbaikan Kritis untuk Mengatasi Masalah 'undefined' ---
        let text = "Maaf, Frissa belum bisa menemukan diagnosisnya. Ada kesalahan pada struktur balasan AI.";

        if (response && response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                // Mencoba mengambil teks dari bagian pertama
                text = candidate.content.parts[0].text;
            }
        }
        // --- Akhir Perbaikan Kritis ---


        if (!text || text.includes("Maaf, Frissa belum bisa menemukan diagnosisnya")) {
             return {
                statusCode: 500,
                body: JSON.stringify({ response: "Maaf, terjadi kesalahan atau balasan AI tidak jelas. Coba jelaskan masalah AC Anda dengan lebih rinci." }),
            };
        }

        // Sukses: Mengembalikan teks balasan AI
        return {
            statusCode: 200,
            body: JSON.stringify({ response: text }),
        };

    } catch (error) {
        // Log error server untuk debugging Netlify Function
        console.error("Kesalahan dalam Netlify Function:", error.message);

        // Mengembalikan pesan yang ramah kepada pengguna
        return {
            statusCode: 500,
            body: JSON.stringify({ response: "Maaf, terjadi kesalahan. Coba jelaskan masalah AC Anda lagi nanti." }),
        };
    }
};
