import api from './api';

const BASE = '/sessions';

export async function fetchSessions(params) {
  const res = await api.get(BASE, { params });
  return res.data;
}

export async function fetchSession(id) {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
}

export async function createSession(payload) {
  const res = await api.post(BASE, payload);
  return res.data;
}

export async function deleteSession(id) {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
}

export default { fetchSessions, fetchSession, createSession, deleteSession };
