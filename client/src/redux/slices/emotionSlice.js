import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  textResult: null,
  audioResult: null,
  videoResult: null,
  fusedResult: null,
  emotionHistory: [],
};

const emotionSlice = createSlice({
  name: 'emotion',
  initialState,
  reducers: {
    setTextResult(state, action) {
      state.textResult = action.payload;
      state.emotionHistory.push({ ...action.payload, modality: 'text' });
      if (state.emotionHistory.length > 100) state.emotionHistory.shift();
    },
    setAudioResult(state, action) {
      state.audioResult = action.payload;
      state.emotionHistory.push({ ...action.payload, modality: 'audio' });
      if (state.emotionHistory.length > 100) state.emotionHistory.shift();
    },
    setVideoResult(state, action) {
      state.videoResult = action.payload;
      state.emotionHistory.push({ ...action.payload, modality: 'video' });
      if (state.emotionHistory.length > 100) state.emotionHistory.shift();
    },
    setFusedResult(state, action) {
      state.fusedResult = action.payload;
      state.emotionHistory.push({ ...action.payload, modality: 'fused' });
      if (state.emotionHistory.length > 100) state.emotionHistory.shift();
    },
    clearEmotionHistory(state) {
      state.emotionHistory = [];
    },
  },
});

export const { setTextResult, setAudioResult, setVideoResult, setFusedResult, clearEmotionHistory } = emotionSlice.actions;
export default emotionSlice.reducer;
