const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;
const HF_ENDPOINT = "https://hnlzsr3iqsdm2iit.us-east-1.aws.endpoints.huggingface.cloud";

app.post('/', async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) {
    console.log("Missing prompt");
    return res.status(400).json({ error: 'Prompt is required' });
  }

  console.log("Prompt received:", prompt);

  try {
    const hfRes = await fetch(HF_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const contentType = hfRes.headers.get('content-type');
    const body = await hfRes.buffer();

    console.log("HF Status:", hfRes.status);
    console.log("HF Content-Type:", contentType);

    if (hfRes.ok && contentType.startsWith('image/')) {
      res.set('Content-Type', contentType);
      return res.send(body);
    } else {
      console.log("HF error body:", body.toString());
      return res.status(hfRes.status).json({
        error: 'Hugging Face error',
        status: hfRes.status,
        message: body.toString()
      });
    }
  } catch (err) {
    console.error("Proxy error:", err.message);
    return res.status(500).json({ error: 'Proxy error', message: err.message });
  }
});

app.listen(10000, () => console.log('Proxy running on port 10000'));
Trigger redeploy


