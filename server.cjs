require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai'); // Import OpenAI

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = process.env.PORT || 3001; // Use environment variable or default

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Simple route for testing
app.get('/', (req, res) => {
  res.send('Hello from AI-Gen DarkMode Backend!');
});

// Route for image generation
app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log(`Generating image for prompt: "${prompt}"`);
    const response = await openai.images.generate({
      model: "dall-e-3", // Reverting back to dall-e-3
      prompt: prompt,
      n: 1, // Number of images to generate
      size: "1024x1024", // Size of the image
      response_format: "url" // Explicitly set response format
    });

    console.log("Image generated successfully.");
    // DALL-E 3 response structure: response.data[0].url
    const imageUrl = response.data[0].url;
    res.json({ imageUrl });

  } catch (error) {
    console.error('Error calling OpenAI:', error.response ? error.response.data : error.message);
    // Send more specific error if available from OpenAI
    if (error.response && error.response.data && error.response.data.error) {
        return res.status(500).json({ error: error.response.data.error.message });
    }
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// Route for prompt enhancement
app.post('/enhance-prompt', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const systemInstruction = `You are an expert prompt enhancer for AI image generation models like DALL-E. 
Rewrite the following user prompt to be more descriptive, detailed, and creative, suitable for generating a high-quality image. 
Focus on visual details, atmosphere, and artistic style if implied. Keep the core subject matter. Respond only with the enhanced prompt itself, no extra text or explanations.`;

  try {
    console.log(`Enhancing prompt: "${prompt}"`);
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      temperature: 0.7, // Allow for some creativity
      max_tokens: 150, // Limit response length reasonably
      n: 1,
    });

    const enhancedPrompt = response.choices[0]?.message?.content?.trim();

    if (!enhancedPrompt) {
      throw new Error('OpenAI did not return an enhanced prompt.');
    }

    console.log(`Enhanced prompt: "${enhancedPrompt}"`);
    res.json({ enhancedPrompt });

  } catch (error) {
    console.error('Error calling OpenAI for prompt enhancement:', error.response ? error.response.data : error.message);
    // Send more specific error if available from OpenAI
    if (error.response && error.response.data && error.response.data.error) {
        return res.status(500).json({ error: error.response.data.error.message });
    }
    res.status(500).json({ error: 'Failed to enhance prompt' });
  }
});

// Route for punkifying prompt
app.post('/punkify-prompt', async (req, res) => {
  const { originalPrompt, punkWord } = req.body;

  if (!originalPrompt || !punkWord) {
    return res.status(400).json({ error: 'Original prompt and punk word are required' });
  }

  console.log(`Punkifying prompt for "${punkWord}"`);

  try {
    // --- AI Call 1: Define the [punkWord] punk style --- 
    const styleDefinitionInstruction = `Describe the core visual aesthetic, mood, and key elements of '${punkWord} punk' style. Focus on details relevant for AI image generation (textures, colors, iconic items, atmosphere). Be concise and descriptive. Respond only with the style description.`;
    
    console.log(`Step 1: Defining '${punkWord} punk' style...`);
    const styleResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        { role: "system", content: "You are a creative assistant defining fictional art styles." },
        { role: "user", content: styleDefinitionInstruction }
      ],
      temperature: 0.6,
      max_tokens: 100, 
      n: 1,
    });

    const styleDescription = styleResponse.choices[0]?.message?.content?.trim();
    if (!styleDescription) {
      throw new Error('Failed to define the punk style description.');
    }
    console.log(`Step 1 Result (Style Description): ${styleDescription}`);

    // --- AI Call 2: Rewrite the prompt using the defined style --- 
    const rewriteInstruction = `Rewrite the following prompt to incorporate the described style: "${styleDescription}". Maintain the original core subject matter found in the prompt: "${originalPrompt}", but infuse it heavily with the style's visual details and atmosphere. Respond only with the rewritten prompt.`;
    
    console.log(`Step 2: Rewriting prompt with style...`);
    const rewriteResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        { role: "system", content: "You are a creative prompt rewriter for AI image generation." },
        { role: "user", content: rewriteInstruction }
      ],
      temperature: 0.7,
      max_tokens: 250, // Allow more tokens for the rewritten prompt
      n: 1,
    });

    const rewrittenPrompt = rewriteResponse.choices[0]?.message?.content?.trim();
    if (!rewrittenPrompt) {
      throw new Error('Failed to rewrite the prompt with the punk style.');
    }
    console.log(`Step 2 Result (Rewritten Prompt): ${rewrittenPrompt}`);

    // --- Send Response --- 
    res.json({ rewrittenPrompt });

  } catch (error) {
    console.error('Error during punkify process:', error.response ? error.response.data : error.message);
    if (error.response && error.response.data && error.response.data.error) {
        return res.status(500).json({ error: `OpenAI Error: ${error.response.data.error.message}` });
    }
    res.status(500).json({ error: 'Failed to punkify prompt' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); 