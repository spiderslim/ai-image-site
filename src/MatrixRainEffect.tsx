import React, { useRef, useEffect } from 'react';
// Remove unused MUI imports
// import { useTheme, Palette } from '@mui/material/styles';

interface MatrixRainEffectProps {
  width: number;
  height: number;
  // Pass relevant palette colors
  colors: {
    background: string; // For clearing
    textPrimary: string;
    primaryMain: string;
    secondaryMain: string;
  };
  promptChars: string; // Add the new prop
}

const MatrixRainEffect: React.FC<MatrixRainEffectProps> = ({ width, height, colors, promptChars }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Remove log outside useEffect
  // console.log('[MatrixEffect] Received promptChars:', promptChars);

  useEffect(() => {
    // Log promptChars when the effect *starts* for this instance
    console.log('[MatrixEffect] Initializing with promptChars:', promptChars);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Set canvas dimensions explicitly
    canvas.width = width;
    canvas.height = height;

    // --- Animation Setup --- 
    // Use unique characters from the prompt, fallback if empty
    const fallbackChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const uniquePromptChars = [...new Set(promptChars.split(''))].join(''); // Get unique chars
    const characters = uniquePromptChars.length > 0 ? uniquePromptChars : fallbackChars;
    
    // Log the derived character set
    console.log('[MatrixEffect] Using characters:', characters);

    const fontSize = 16;
    const columns = Math.ceil(width / fontSize);
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -height; // Start drops above the screen
    }

    // --- Animation Loop --- 
    const draw = () => {
      // Clear with semi-transparent background (use passed color)
      // Convert hex to rgba for transparency
      let r = 0, g = 0, b = 0;
      if (colors.background.startsWith('#')) {
        const bigint = parseInt(colors.background.slice(1), 16);
        r = (bigint >> 16) & 255;
        g = (bigint >> 8) & 255;
        b = bigint & 255;
      }
      ctx.fillStyle = `rgba(${r},${g},${b},0.05)`; // Low alpha for trails
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const yPos = drops[i] * fontSize;

        // Draw the character
        // Make the leading character white
        if (Math.random() > 0.1) { // Occasionally skip drawing for variety
            ctx.fillStyle = colors.textPrimary; // White leader
            ctx.fillText(text, i * fontSize, yPos);
        
            // Add trailing colors slightly above (can be improved)
            // Simple approach: draw previous chars in theme colors
            const trailLength = 5; // How many chars trail
            for(let j = 1; j < trailLength; j++) {
                const trailY = yPos - (j * fontSize);
                if (trailY > 0) { // Only draw if on canvas
                    // Alternate trail colors
                    ctx.fillStyle = (j % 2 === 0) ? colors.primaryMain : colors.secondaryMain;
                    // Fade trail (optional, complex)
                    // ctx.globalAlpha = 1 - (j / trailLength);
                    const trailText = characters.charAt(Math.floor(Math.random() * characters.length));
                    ctx.fillText(trailText, i*fontSize, trailY);
                    // ctx.globalAlpha = 1.0; // Reset alpha
                }
            }
        }

        // Reset drop randomly or if it goes off screen
        if (yPos > height && Math.random() > 0.975) {
          drops[i] = 0; // Reset position to top
        }
        drops[i]++; // Move drop down
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };

    draw(); // Start the animation

    // --- Cleanup --- 
    return () => {
      cancelAnimationFrame(animationFrameId);
    };

  }, [width, height, colors]); // Remove promptChars from dependency array

  return (
    <canvas 
      ref={canvasRef} 
      style={{ display: 'block' }} // Ensure canvas behaves like a block element
    />
  );
};

export default MatrixRainEffect; 