import { createMuiTheme } from '@material-ui/core/styles';

export const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#bf8c53',
      main: '#af7028',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#888888',
      main: '#6b6b6b',
      dark: '#4a4a4a',
      contrastText: '#fff',
    },
  },
  classes: {
    fixedHeightPaper: 'calc(100vh - 315px)',
    fixedHeightPaperMinHeight: 400,
    fixedHeightPaperToolBar: 70
  }
});
