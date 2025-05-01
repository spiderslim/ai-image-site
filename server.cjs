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

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); 