import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { setAuthStart, setAuthSuccess, setAuthFailure } from '../redux/slices/authSlice';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setAuthStart());
    setSubmitting(true);
    try {
      const res = await authService.register({ name, email, password });
      dispatch(setAuthSuccess({ user: res.user || null, token: res.token }));
      setSubmitting(false);
      navigate('/live');
    } catch (err) {
      dispatch(setAuthFailure(err.message || 'Registration failed'));
      setSubmitting(false);
      console.error(err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 3, mt: 6 }}>
        <Typography variant="h6" component="h1" gutterBottom>Register</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField label="Name" required fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Email" type="email" required fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Password" type="password" required fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={submitting} sx={{ mt: 2 }}>
            {submitting ? 'Registering…' : 'Register'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
