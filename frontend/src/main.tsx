import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { blue } from '@mui/material/colors'; // Import blue color
// import './index.css' // Remove this import

// Create a dark theme instance
const theme = createTheme({
  palette: {
    mode: 'dark', // Set dark mode
    primary: {
      main: blue[500], // Set primary color to blue
    },
    // You can customize other colors too, e.g., secondary, background
    // background: {
    //   default: '#121212', // Default dark background
    //   paper: '#1e1e1e', // Default dark paper background
    // },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Apply baseline styles */}      
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
