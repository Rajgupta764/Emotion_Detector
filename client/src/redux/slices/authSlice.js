import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token') || null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token,
    isAuthenticated: !!token,
    loading: false,
    error: null,
  },
  reducers: {
    setAuthStart(state) {
      state.loading = true;
      state.error = null;
    },
    setAuthSuccess(state, action) {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      try { if (action.payload.token) localStorage.setItem('token', action.payload.token); } catch(e){}
    },
    setAuthFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
});

export const { setAuthStart, setAuthSuccess, setAuthFailure, logout } = authSlice.actions;
export default authSlice.reducer;
