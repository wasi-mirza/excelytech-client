import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#55e0c2',
      light: '#7ae7d0',
      dark: '#3b9c86',
      contrastText: '#0C1C2E',
    },
    secondary: {
      main: '#34B898',
      light: '#5cc6ad',
      dark: '#24806a',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#0C1C2E',
      secondary: 'rgba(12, 28, 46, 0.7)',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      color: '#0C1C2E',
    },
    h2: {
      color: '#0C1C2E',
    },
    h3: {
      color: '#0C1C2E',
    },
    h4: {
      color: '#0C1C2E',
    },
    h5: {
      color: '#0C1C2E',
    },
    h6: {
      color: '#0C1C2E',
    },
    body1: {
      color: '#0C1C2E',
    },
    body2: {
      color: 'rgba(12, 28, 46, 0.7)',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme; 