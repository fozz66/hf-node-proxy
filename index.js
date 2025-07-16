const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;
const HF_ENDPOINT = "https://kxofyx70ftkqr0d4.us-east-1.aws.endpoints.huggingface.cloud";

app.post('/', async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) {
    console.log("❌ Missing prompt");
    return res.status(400).json({ error: 'Prompt is required' });
  }

  console.log("✅ Prompt received:", prompt);
  console.log("➡️ Sending prompt to Hugging Face...");

  try {
    console.log("➡️ Sending prompt to Hugging Face...");

let hfRes;
let retries = 3;
while (retries--) {
  try {
    hfRes = await fetch(HF_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt }),
      timeout: 90000 // allow 90 seconds
    });

    console.log(`✅ Hugging Face responded: ${hfRes.status}`);

    if (hfRes.ok) break;

    console.warn(`⚠️ Hugging Face returned status ${hfRes.status}`);
    await new Promise(res => setTimeout(res, 5000)); // wait before retrying
  } catch (err) {
    console.error("❌ Proxy fetch error:", err.message || err);
    await new Promise(res => setTimeout(res, 5000)); // wait before retrying
  }
}

if (!hfRes || !hfRes.ok) {
  return res.status(503).send({ error: "Proxy failed after retries." });
}

    console.log(`✅ Hugging Face responded: ${hfRes.status}`);

    if (!hfRes.ok) {
      const errorText = await hfRes.text();
      console.error("❌ Hugging Face Error:", errorText);
      return res.status(hfRes.status).json({ error: 'Hugging Face Error', details: errorText });
    }

    const contentType = hfRes.headers.get('content-type') || 'image/png';
    const buffer = await hfRes.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    console.log("✔️ Returning base64 image to client.");
    return res.status(200).json({
      image: `data:${contentType};base64,${base64Image}`
    });

  } catch (err) {
    console.error("🔥 Proxy error:", err.message || err);
    return res.status(500).json({ error: "Proxy failed to fetch image." });
  }
});

app.listen(10000, () => console.log('🚀 Proxy running on port 10000'));





