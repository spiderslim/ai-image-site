import { createTheme } from '@mui/material/styles';

// Define the dark theme based on the plan
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00BFFF', // DeepSkyBlue for a neon blue hint
    },
    // No secondary color specified, MUI will derive defaults
    background: {
      default: '#121212', // Standard dark background
      paper: '#1E1E1E',   // Slightly lighter surface color
    },
    text: {
      primary: '#FFFFFF', // White
      secondary: 'rgba(255, 255, 255, 0.7)', // Light grey
    },
  },
  // Optional: Add typography overrides here later if desired
  // typography: {
  //   fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  // },
});

export default theme; 