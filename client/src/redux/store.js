import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import emotionReducer from './slices/emotionSlice';
import sessionReducer from './slices/sessionSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    emotion: emotionReducer,
    session: sessionReducer,
  },
});

export default store;
