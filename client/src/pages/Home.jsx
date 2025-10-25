import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

const Home = () => {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const user = useSelector((s) => s.auth.user);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Multimodal Emotion Recognition
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720, mx: 'auto', mb: 4 }}>
          Real-time emotion detection from video, audio and text. Try the Live Analysis to see how multiple sensors combine
          to produce a fused emotion prediction.
        </Typography>

        <style>{`
          @keyframes bounce { 0% { transform: translateY(0); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0); } }
        `}</style>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 4 }} alignItems="center">
          <Box sx={{ fontSize: 48, display: 'inline-block', animation: 'bounce 1.6s infinite' }} aria-hidden>😊</Box>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h6" sx={{ mb: 0 }}>{isAuthenticated ? `Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}!` : 'Welcome!'}</Typography>
            <Typography variant="body2" color="text.secondary">{isAuthenticated ? 'Start a new live session or explore your dashboard.' : 'Sign in or register to save sessions and export results.'}</Typography>
          </Box>
        </Stack>

        <Stack direction="row" justifyContent="center" sx={{ mb: 6 }}>
          <Button component={Link} to="/live" variant="contained" color="secondary" size="large">Try Live Analysis</Button>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Paper sx={{ p: 3, textAlign: 'left' }} elevation={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Fast setup</Typography>
            <Typography variant="body2" color="text.secondary">Scaffolded React + Socket.IO frontend with mock backend for quick testing.</Typography>
          </Paper>

          <Paper sx={{ p: 3, textAlign: 'left' }} elevation={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Multimodal</Typography>
            <Typography variant="body2" color="text.secondary">Combine video, audio and text modalities and visualize fused results.</Typography>
          </Paper>

          <Paper sx={{ p: 3, textAlign: 'left' }} elevation={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Export & Sessions</Typography>
            <Typography variant="body2" color="text.secondary">Record sessions and export fused predictions for analysis.</Typography>
          </Paper>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">About this project: This demo implements a multimodal emotion recognition pipeline using webcam frames, audio chunks and text inputs. It uses a mock analysis service for fast experimentation and a simple fusion algorithm to merge modality predictions into a single result. Start a live session to see real-time detection and save sessions for later export.</Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
