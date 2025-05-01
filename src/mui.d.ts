import '@mui/material/styles';

declare module '@mui/material/styles' {
  // Allow for custom palette colors (e.g., accent)
  interface Palette {
    accent: Palette['primary'];
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}

// Optional: If you plan to customize Button props later
// declare module '@mui/material/Button' {
//   interface ButtonPropsColorOverrides {
//     accent: true;
//   }
// } 