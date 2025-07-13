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

console.log("➡️ Forwarding prompt to Hugging Face...");

try {
  console.log("➡️ Forwarding prompt to Hugging Face...");

  const hfRes = await fetch(HF_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: prompt }),
    timeout: 120000 // allow up to 2 minutes
  });

  console.log(`✅ Hugging Face responded: ${hfRes.status}`);

  const contentType = hfRes.headers.get("content-type") || "";
  if (!hfRes.ok || !contentType.includes("image")) {
    const errBody = await hfRes.text();
    console.error("❌ HF error:", hfRes.status, errBody);
    res.status(500).send({ error: "HF request failed", details: errBody });
    return;
  }

  const imageBuffer = await hfRes.arrayBuffer();
  res.setHeader("Content-Type", contentType);
  res.send(Buffer.from(imageBuffer));
} catch (err) {
  console.error("🔥 Proxy error:", err.message || err);
  res.status(500).send({ error: "Proxy failed to fetch image." });
}

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



