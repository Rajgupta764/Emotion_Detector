import { createSlice } from '@reduxjs/toolkit';

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    sessions: [],
    currentSession: null,
    activeSessionId: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSessions(state, action) {
      state.sessions = action.payload;
    },
    addSession(state, action) {
      state.sessions.unshift(action.payload);
    },
    setCurrentSession(state, action) {
      state.currentSession = action.payload;
    },
    setActiveSessionId(state, action) {
      state.activeSessionId = action.payload;
    },
    removeSession(state, action) {
      state.sessions = state.sessions.filter((s) => s._id !== action.payload);
    },
  },
});

export const { setSessions, addSession, setCurrentSession, setActiveSessionId, removeSession } = sessionSlice.actions;
export default sessionSlice.reducer;
