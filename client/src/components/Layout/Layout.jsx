import React from 'react';
import Navbar from './Navbar';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const Layout = ({ children }) => {
  return (
    <div>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EmotionDetector
          </Typography>
          <Navbar />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {children}
      </Container>

      <footer style={{ padding: 12, borderTop: '1px solid #e0e0e0', marginTop: 24, textAlign: 'center' }}>
        © {new Date().getFullYear()} MER
      </footer>
    </div>
  );
};

export default Layout;
