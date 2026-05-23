import { createTheme } from '@mui/material/styles';

const baseTheme = {
  typography: {
    fontFamily: '"Inter", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h5: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: { borderRadius: 10 },
  transitions: {
    duration: {
      shortest: 100,
      shorter: 150,
      short: 200,
      standard: 250,
    },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
        },
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? '#E5E5E5' : '#000000',
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
        head: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'dark' ? '#0A0A0A' : '#F5F1E9',
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#F5F1E9',
          },
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#E8E2D5',
        }),
      },
    },
  },
};

// 🌞 Light Theme - Cálido y sofisticado
export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: { main: '#0A0A0A' },
    secondary: { main: '#FF5A1F' },
    success: { main: '#0A7A4F' },
    error: { main: '#D92D20' },
    warning: { main: '#E67E22' },
    info: { main: '#3B82F6' },
    background: { 
      default: '#E8E2D5', 
      paper: '#F5F1E9',
    },
    divider: '#D6CFC2',
    text: { 
      primary: '#0A0A0A', 
      secondary: '#5C544B',
    },
  },
});

// 🌚 Dark Theme - Negro puro con acentos cálidos
export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: { main: '#FFFFFF' },
    secondary: { main: '#FF7A45' },
    success: { main: '#10B981' },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
    info: { main: '#60A5FA' },
    background: { 
      default: '#000000', 
      paper: '#0A0A0A',
    },
    divider: '#1A1A1A',
    text: { 
      primary: '#E8E2D5', 
      secondary: '#A8A095',
    },
  },
  components: {
    ...baseTheme.components,
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '& fieldset': {
            borderColor: '#1A1A1A',
          },
          '&:hover fieldset': {
            borderColor: '#404040',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#FFFFFF',
          },
        },
      },
    },
  },
});

export const theme = lightTheme;