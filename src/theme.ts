import { createTheme, experimental_extendTheme as extendTheme } from '@mui/material/styles';

const lightTheme = createTheme();

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const theme = extendTheme({
  colorSchemes: {
    light: { // palette for light mode
      palette: lightTheme.palette
    },
    dark: { // palette for dark mode
      palette: darkTheme.palette
    }
  }
})

export default theme;
