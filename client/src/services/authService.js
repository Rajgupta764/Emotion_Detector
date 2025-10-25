import api from './api';

const AUTH_URL = '/auth';

export async function login(email, password) {
  const res = await api.post(`${AUTH_URL}/login`, { email, password });
  if (res.data.token) {
    localStorage.setItem('token', res.data.token);
  }
  return res.data;
}

export async function register({ name, email, password }) {
  const res = await api.post(`${AUTH_URL}/register`, { name, email, password });
  if (res.data.token) {
    localStorage.setItem('token', res.data.token);
  }
  return res.data;
}

export function logout() {
  localStorage.removeItem('token');
}

export async function fetchMe() {
  const res = await api.get(`${AUTH_URL}/me`);
  return res.data;
}

export default { login, register, logout, fetchMe };
