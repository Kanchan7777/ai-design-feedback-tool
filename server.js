import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve frontend files
app.use(express.static(__dirname));

app.post('/get-feedback', async (req, res) => {
    const { imageBase64, mimeType } = req.body;

    const prompt = `You are an expert UI/UX designer. Analyze this UI screenshot and provide specific, actionable design feedback. Cover: layout & spacing, typography, color contrast, visual hierarchy, and usability issues. Be concise and constructive.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: mimeType,
                                    data: imageBase64
                                }
                            }
                        ]
                    }]
                })
            }
        );

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
        const feedback = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No feedback generated.';
        res.json({ feedback });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get feedback from Gemini.' });
    }
});

// Catch-all to serve index.html for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));