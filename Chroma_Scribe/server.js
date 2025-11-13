import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Replicate from 'replicate';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const replicate = new Replicate({
    apiKey: process.env.REPLICATE_API_TOKEN,
});

app.post('/api/evolve', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required.' });
        }

        console.log(`Generating image for prompt: ${prompt}`);

        const output = await replicate.run(
            // NEW WORKING MODEL ID (Stable Diffusion XL):
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            {
                input: {
                    prompt: prompt
                }
            }
        );
        
        console.log("Image generated:", output);
        res.json(output);

    } catch (error) {
        console.error('Error calling Replicate:', error);
        res.status(500).json({ error: error.message || 'Failed to evolve image.' });
    }
});

app.listen(port, () => {
    console.log(`Chroma-Scribe proxy server listening on http://localhost:${port}`);
});