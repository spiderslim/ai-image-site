import React, { useState, useRef } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack'; // Import Stack for button layout
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles'; // Import useTheme hook
import { keyframes } from '@mui/system'; // Import keyframes for animation

// Define backend URL (replace if different)
const BACKEND_URL = 'http://localhost:3001';

function App() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null); // State for the generated image URL
  const [loadingGenerate, setLoadingGenerate] = useState(false); // Renamed
  const [error, setError] = useState<string | null>(null); // State for error messages
  const theme = useTheme(); // Get the theme object

  // Ref for the prompt input bubble to measure its size
  const promptBubbleRef = useRef<HTMLDivElement>(null);

  // State for PUNK feature
  const [showPunkInput, setShowPunkInput] = useState(false);
  const [punkWord, setPunkWord] = useState('');
  // Add loading state for punkify process
  const [loadingPunkify, setLoadingPunkify] = useState(false);
  // Re-introduce loading state for standard enhance
  const [loadingEnhance, setLoadingEnhance] = useState(false);

  // Define the glow animation *inside* the component where theme is typed
  const glow = keyframes`
    0% { box-shadow: 0 0 3px ${theme.palette.accent?.main ?? '#674065'}; }
    50% { box-shadow: 0 0 10px 3px ${theme.palette.accent?.main ?? '#674065'}; }
    100% { box-shadow: 0 0 3px ${theme.palette.accent?.main ?? '#674065'}; }
  `;

  const handleGenerate = async () => {
    console.log('Generate image with prompt:', prompt);
    setLoadingGenerate(true); // Use specific loading state
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
      setLoadingGenerate(false); // Use specific loading state
    }
  };

  // --- Re-introduce handleEnhancePrompt --- 
  const handleEnhancePrompt = async () => {
    if (!prompt || loadingGenerate || loadingEnhance || loadingPunkify) return;
    console.log("Enhancing prompt:", prompt);
    setLoadingEnhance(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/enhance-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try { const errorData = await response.json(); errorMessage = errorData.error || errorMessage; } catch { /* ignore */ }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setPrompt(data.enhancedPrompt);
      console.log("Prompt enhanced successfully.");
    } catch (err) {
      console.error('Enhance API call failed:', err);
      let message = 'Failed to enhance prompt.';
      if (err instanceof Error) { message = err.message; }
      setError(message);
    } finally {
      setLoadingEnhance(false);
    }
  };
  // --- End handleEnhancePrompt --- 

  // --- Rename handlePunkClick to handlePunkItClick --- 
  const handlePunkItClick = async () => {
    if (loadingGenerate || loadingEnhance || loadingPunkify) return; // Check all loading states

    if (!showPunkInput) {
      setShowPunkInput(true);
      console.log("PUNK IT! input revealed.");
    } else {
      if (!punkWord) return;
      console.log(`Triggering PUNK IT! process for prompt: "${prompt}" with word: "${punkWord}"`);
      setLoadingPunkify(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/punkify-prompt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ originalPrompt: prompt, punkWord }),
        });

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch /* Removed unused (jsonError) */ {
            // Ignore if response is not JSON or other error occurs here
            console.error('Could not parse error JSON during PUNK request.');
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setPrompt(data.rewrittenPrompt);
        setShowPunkInput(false);
        setPunkWord('');
        console.log("Prompt punkified successfully.");

      } catch (err) {
        console.error('Punkify API call failed:', err);
        let message = 'Failed to punkify prompt.';
        if (err instanceof Error) { message = err.message; }
        setError(message);
        // Keep input open on error maybe? Decide later.
      } finally {
        setLoadingPunkify(false);
      }
    }
  };
  // --- End handlePunkItClick --- 

  const handlePoemClick = () => {
    // TODO: Implement poem interaction
    console.log("Poem placeholder clicked");
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
          gap: 2, // Add some gap between elements
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ color: theme.palette.accent?.main ?? theme.palette.text.primary }}
        >
          AI Image Generator
        </Typography>
        
        {/* Placeholder for Poem Animation */}
        <Typography 
          variant="caption" 
          onClick={handlePoemClick} 
          sx={{
            color: theme.palette.accent?.main ?? theme.palette.text.secondary,
            cursor: 'pointer',
            fontStyle: 'italic' 
          }}
        >
          [Poem typing animation placeholder...]
        </Typography>
        
        {/* Wrapper for positioning canvas */}
        <Box sx={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
          {/* Custom Prompt Input Bubble */}
          <Box
            ref={promptBubbleRef} // Add ref here
            sx={{
              width: '100%', 
              maxWidth: '700px', // Max width for the bubble
              backgroundColor: 'background.paper', // Prussian Blue
              borderRadius: '20px', // Rounded corners
              padding: theme.spacing(2, 3), // Internal padding
              marginBottom: theme.spacing(2),
              border: `1px solid ${theme.palette.secondary.dark}`, // Subtle Cerulean border
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)', // Subtle shadow
              transition: 'box-shadow 0.3s ease-in-out', // Smooth transition for glow
              '&:focus-within': { 
                animation: `${glow} 1.5s infinite ease-in-out`,
                boxShadow: `0 0 8px 2px ${theme.palette.accent?.main ?? '#674065'}`,
              },
            }}
          >
            <TextField
              fullWidth
              label="What do you want to create?" // Label still useful for accessibility
              multiline
              rows={3}
              variant="filled" // Use filled variant
              hiddenLabel // Hide the label visually, but keep for accessibility
              value={prompt} // Use the actual prompt state again
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loadingGenerate || loadingEnhance || loadingPunkify} // Disable if punkifying too
              inputProps={{
                sx: {
                  fontSize: '1.3rem', // Slightly larger font
                  fontWeight: '500',
                  lineHeight: '1.6',
                  padding: '10px 0px', // Adjust padding for filled variant
                }
              }}
              sx={{ 
                // Remove default filled background and underline
                backgroundColor: 'transparent', 
                '& .MuiFilledInput-root': {
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'transparent',
                  },
                  '&::before, &::after': {
                    display: 'none', // Hide the underline
                  },
                },
              }}
            />
          </Box>
        </Box>
        
        {/* Conditionally Render PUNK Style Input */}      
        {showPunkInput && (
          <TextField
            fullWidth
            label="Enter a word to PUNK the style" 
            variant="outlined"
            size="small"
            value={punkWord}
            onChange={(e) => setPunkWord(e.target.value)}
            sx={{ maxWidth: '400px', marginTop: 1 }} // Limit width, add margin
            disabled={loadingGenerate || loadingEnhance || loadingPunkify} // Disable if punkifying
          />
        )}

        {/* Stack for Enhance and Punk Buttons ONLY */}
        <Stack direction="row" spacing={2} sx={{ marginTop: 1, marginBottom: 2, justifyContent: 'center' }}>
          {/* Remove Generate Button from here */}

          {/* Enhance Prompt Button */}
          <Button
            variant="contained"
            color="info"
            onClick={handleEnhancePrompt} 
            disabled={!prompt || loadingGenerate || loadingEnhance || loadingPunkify}
          >
            {loadingEnhance ? <CircularProgress size={24} color="inherit" /> : 'Enhance Prompt'}
          </Button>

          {/* PUNK IT! Button */}
          <Button
            variant="contained" 
            color="secondary" 
            onClick={handlePunkItClick}
            disabled={loadingGenerate || loadingEnhance || loadingPunkify || (showPunkInput && !punkWord)}
          >
            {loadingPunkify ? <CircularProgress size={24} color="inherit" /> : (showPunkInput ? 'Apply PUNK Style' : 'PUNK IT!')}
          </Button>
        </Stack>

        {/* Center Generate Button Separately */}      
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 4, marginBottom: 2 }}>
          <Button 
            variant="contained" 
            size="large" // Make button larger
            onClick={handleGenerate} 
            disabled={!prompt || loadingGenerate || loadingEnhance || loadingPunkify}
            sx={{ 
              minWidth: '200px', // Give it some minimum width
              // Keep hover gradient if desired
              '&:hover': {
                background: `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
              },
            }}
          >
            {loadingGenerate ? <CircularProgress size={24} color="primary" /> : 'Generate Image'}
          </Button>
        </Box>

        {/* Error Display */}      
        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        {/* Image Display Area */}      
        {imageUrl && !loadingGenerate && (
          <Card sx={{ maxWidth: 512, marginTop: 2, backgroundColor: 'background.paper' }}> {/* Explicitly use paper for card */}
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
