const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;
const HF_ENDPOINT = "https://hnlzsr3iqsdm2iit.us-east-1.aws.endpoints.huggingface.cloud";

app.post('/', async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const hfRes = await fetch(HF_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const buffer = await hfRes.buffer();
    if (hfRes.ok) {
      res.set('Content-Type', 'image/png');
      return res.send(buffer);
    } else {
      return res.status(hfRes.status).json({ error: 'Hugging Face error', details: buffer.toString() });
    }
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
});

app.listen(10000, () => console.log('Proxy running on port 10000'));
