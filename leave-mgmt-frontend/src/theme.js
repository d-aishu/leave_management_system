import { createTheme } from '@mui/material/styles';

// Palette: deep indigo for primary actions/brand, slate for structure,
// warm amber for pending state, calm green for approved, muted red for rejected.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3730A3', // indigo-800
      light: '#5B52C7',
      dark: '#272166',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#0F766E' // teal-700, used sparingly for secondary accents
    },
    background: {
      default: '#F6F5F3',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1E1B3A',
      secondary: '#5C5876'
    },
    success: { main: '#15803D' },
    warning: { main: '#B45309' },
    error: { main: '#B91C1C' },
    divider: '#E5E3F1'
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' }
  },
  shape: {
    borderRadius: 10
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingLeft: 18,
          paddingRight: 18
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#272166'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: '#F1F0FA',
          color: '#1E1B3A'
        }
      }
    }
  }
});

export default theme;
