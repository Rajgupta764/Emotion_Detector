import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import authService from '../../services/authService';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

const Navbar = () => {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    navigate('/');
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Link component={RouterLink} to="/" color="inherit" underline="none">Home</Link>
      {isAuthenticated && <Link component={RouterLink} to="/dashboard" color="inherit" underline="none">Dashboard</Link>}
      {isAuthenticated && <Link component={RouterLink} to="/live" color="inherit" underline="none">Live</Link>}
      {isAuthenticated && <Link component={RouterLink} to="/sessions" color="inherit" underline="none">Sessions</Link>}

      <div style={{ marginLeft: 12 }}>
        {isAuthenticated ? (
          <>
            <span style={{ marginRight: 8 }}>{user?.name || user?.email}</span>
            <Button color="inherit" onClick={handleLogout} size="small">Logout</Button>
          </>
        ) : (
          <>
            <Button component={RouterLink} to="/login" color="inherit" size="small">Login</Button>
            <Button component={RouterLink} to="/register" color="inherit" size="small">Register</Button>
          </>
        )}
      </div>
    </Stack>
  );
};

export default Navbar;
