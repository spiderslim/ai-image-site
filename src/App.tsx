import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

// Define backend URL (replace if different)
const BACKEND_URL = 'http://localhost:3001';

function App() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null); // State for the generated image URL
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState<string | null>(null); // State for error messages

  const handleGenerate = async () => {
    console.log('Generate image with prompt:', prompt);
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await fetch(`${BACKEND_URL}/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        // Try to get error message from backend response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // Ignore if response is not JSON
          console.error('Could not parse error JSON:', jsonError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);

    } catch (err) {
      console.error('API call failed:', err);
      // Check if err is an instance of Error before accessing message
      let message = 'Failed to generate image. Please check the backend.';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md"> {/* Widened container slightly */}      
      <Box 
        sx={{
          marginTop: 4,
          marginBottom: 4, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          AI Image Generator
        </Typography>
        
        <TextField 
          fullWidth 
          label="Enter image prompt" 
          variant="outlined" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          margin="normal"
          disabled={loading} // Disable input while loading
        />
        
        <Button 
          variant="contained" 
          onClick={handleGenerate} 
          disabled={!prompt || loading} // Disable if prompt empty or loading
          sx={{ marginTop: 2, marginBottom: 3 }}
        >
          {loading ? <CircularProgress size={24} color="primary" /> : 'Generate Image'}
        </Button>

        {/* Error Display */}      
        {error && (
          <Alert severity="error" sx={{ width: '100%', marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        {/* Image Display Area */}      
        {imageUrl && !loading && (
          <Card sx={{ maxWidth: 512, marginTop: 2 }}> {/* Adjust size as needed */}            
            <CardMedia
              component="img"
              image={imageUrl}
              alt="Generated AI Image"
              sx={{ width: '100%', height: 'auto' }} 
            />
          </Card>
        )}

      </Box>
    </Container>
  );
}

export default App;
