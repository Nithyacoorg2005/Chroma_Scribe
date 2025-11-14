import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const port = 3001;

app.use(cors());
// Increase the limit to 10mb to handle the snapshot image
app.use(express.json({ limit: '10mb' })); 

const HF_API_KEY = process.env.HUGGINGFACE_API_TOKEN;

app.post('/api/evolve', async (req, res) => {
    try {
        const { image, prompt } = req.body;
        if (!image || !prompt) {
            return res.status(400).json({ error: 'Image and prompt are required.' });
        }

        console.log(`Generating image via Hugging Face for prompt: ${prompt}`);

        // --- THIS IS THE FINAL FIX ---

        // 1. We are using the NEW router URL from the error message.
        const response = await fetch(
            "https://router.huggingface.co/hf-inference", 
            {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                // 2. We send the model ID INSIDE the body,
                //    along with the inputs for that model.
                body: JSON.stringify({
                    model: "lllyasviel/control_v11p_sd15_scribble",
                    inputs: [
                        prompt,
                        image // The base64 data URL from the app
                    ]
                }),
            }
        );
        // --- END OF FIX ---

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API Error Details:', errorText);
            throw new Error(`Hugging Face API Error: ${response.statusText}`);
        }

        const imageBlob = await response.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Convert to Base64 Data URL so React can display it
        const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        
        console.log("Image generated successfully!");
        res.json([base64Image]); // Send it back as an array

    } catch (error) {
        console.error('Error calling Hugging Face:', error);
        res.status(500).json({ error: 'Failed to evolve image.' });
    }
});

app.listen(port, () => {
    console.log(`Chroma-Scribe proxy server listening on http://localhost:${port}`);
});