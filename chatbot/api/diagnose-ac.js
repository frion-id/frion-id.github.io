import { GoogleGenerativeAI } from "@google/generative-ai";

// Mengubah format export menjadi default function yang menerima (req, res)
export default async function handler(req, res) {
    // Memeriksa metode request dari objek 'req'
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Mengambil pesan dari 'req.body'. Vercel otomatis mem-parsing JSON.
        const { message } = req.body;

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        const systemPrompt = `Anda adalah seorang teknisi AC virtual yang sangat berpengalaman dan ramah bernama 'AI FRION'. Tugas Anda adalah membantu pengguna mendiagnosis masalah AC mereka berdasarkan deskripsi singkat. Berikan kemungkinan penyebab dan beberapa langkah perbaikan sederhana yang bisa dicoba oleh orang awam. Selalu akhiri jawaban dengan saran untuk menghubungi teknisi profesional jika masalah berlanjut dan sertakan pesan promosi seperti "Hubungi FRION di 0881010050528 untuk penanganan lebih lanjut." Gunakan bahasa Indonesia yang mudah dimengerti. Jangan memberikan jawaban yang terlalu teknis.`;
        
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash-latest",
            systemInstruction: systemPrompt 
        });

        const chat = model.startChat({
            history: [],
        });

        const result = await chat.sendMessage(message);
        const aiReply = result.response.text();

        // Mengirim respon sukses menggunakan objek 'res'
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        console.error("Error in Vercel function:", error);
        // Mengirim respon error menggunakan objek 'res'
        return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
}
