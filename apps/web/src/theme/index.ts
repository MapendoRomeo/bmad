import { createTheme, alpha } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1B5E7B',
      light: '#4A8BA8',
      dark: '#0D3B50',
      contrastText: '#fff',
    },
    secondary: {
      main: '#E8913A',
      light: '#F2B06E',
      dark: '#C47020',
      contrastText: '#fff',
    },
    success: { main: '#2E7D5B', light: '#4CAF7D' },
    warning: { main: '#ED8A19', light: '#FFB74D' },
    error: { main: '#D32F2F', light: '#EF5350' },
    info: { main: '#1976D2' },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2138',
      secondary: '#5A6A85',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, fontSize: '1.75rem' },
    h5: { fontWeight: 600, fontSize: '1.4rem' },
    h6: { fontWeight: 600, fontSize: '1.125rem' },
    subtitle1: { fontWeight: 500 },
    body2: { color: '#5A6A85' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.04)',
    '0 2px 6px rgba(0,0,0,0.06)',
    '0 4px 12px rgba(0,0,0,0.08)',
    '0 6px 16px rgba(0,0,0,0.10)',
    '0 8px 24px rgba(0,0,0,0.12)',
    ...Array(19).fill('0 8px 24px rgba(0,0,0,0.12)'),
  ] as unknown as typeof createTheme extends (o: infer T) => unknown ? T extends { shadows: infer S } ? S : never : never,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '8px 20px',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(27, 94, 123, 0.25)',
          '&:hover': { boxShadow: '0 4px 12px rgba(27, 94, 123, 0.35)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: '#F5F7FA',
            color: '#1A2138',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
  },
});
