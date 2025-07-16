// api/cohere.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).json({ error: "No prompt provided" });
    return;
  }

  try {
    const response = await fetch("https://api.cohere.ai/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-xlarge-nightly",
        prompt,
        max_tokens: 100,
        temperature: 0.7,
        k: 0,
        stop_sequences: [],
      }),
    });
    const data = await response.json();
    if (data.generations && data.generations.length > 0) {
      res.status(200).json({ text: data.generations[0].text });
    } else {
      res.status(500).json({ error: "No generations returned" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
