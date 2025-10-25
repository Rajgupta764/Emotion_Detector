/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import useWebcam from '../hooks/useWebcam';
import useAudioRecorder from '../hooks/useAudioRecorder';
import { connectSocket, getSocket, disconnectSocket } from '../services/socket';
import { useDispatch, useSelector } from 'react-redux';
import { setVideoResult, setAudioResult, setFusedResult, setTextResult } from '../redux/slices/emotionSlice';
import { EMOTION_EMOJIS } from '../utils/emotionColors';
import EmotionBadge from '../components/Shared/EmotionBadge';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const LiveAnalysis = () => {
  const dispatch = useDispatch();
  const { videoRef, start: startCamera, stop: stopCamera, capture, isOn } = useWebcam();
  const { start: startAudio, stop: stopAudio, recording } = useAudioRecorder();

  const socketRef = useRef(null);
  const videoIntervalRef = useRef(null);
  const videoBufferRef = useRef([]);
  const VIDEO_SMOOTH_WINDOW = 5;
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [textInput, setTextInput] = useState('');
  const fused = useSelector((s) => s.emotion.fusedResult);
  const videoResult = useSelector((s) => s.emotion.videoResult);
  const audioResult = useSelector((s) => s.emotion.audioResult);
  const textResult = useSelector((s) => s.emotion.textResult);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      try { stopCamera(); } catch (e) {}
      try { stopAudio(); } catch (e) {}
      disconnectSocket();
    };
    // eslint-disable-next-line
  }, []);

  const handleConnect = () => {
    const sock = connectSocket();
    socketRef.current = sock;

    sock.on('connect', () => setConnected(true));
    sock.on('disconnect', () => setConnected(false));

    sock.on('session-created', (data) => {
      // server may respond with sessionId
      if (data && data.sessionId) setSessionId(data.sessionId);
    });

    sock.on('session-ended', (data) => {
      // server confirmed end
      if (data && data.sessionId) {
        if (data.sessionId === sessionId) {
          setSessionId(null);
        }
      }
      // ensure client can start a new session
      try { disconnectSocket(); } catch (e) {}
      setConnected(false);
      socketRef.current = null;
    });

    sock.on('emotion-result', (payload) => {
      // payload: { modality, detectedEmotion, confidence, scores, timestamp }
      if (!payload) return;
      const { modality } = payload;
      if (modality === 'video') {
        // smoothing: keep short sliding window of scores and average them to reduce jitter
        try {
          if (payload.scores && typeof payload.scores === 'object') {
            videoBufferRef.current.push(payload.scores);
            if (videoBufferRef.current.length > VIDEO_SMOOTH_WINDOW) videoBufferRef.current.shift();
            // average scores
            const avg = {};
            videoBufferRef.current.forEach((s) => {
              Object.keys(s).forEach((k) => { avg[k] = (avg[k] || 0) + (s[k] || 0); });
            });
            const len = videoBufferRef.current.length || 1;
            Object.keys(avg).forEach((k) => { avg[k] = avg[k] / len; });
            // pick top
            let top = null;
            let topVal = -Infinity;
            Object.keys(avg).forEach((k) => {
              if (avg[k] > topVal) { top = k; topVal = avg[k]; }
            });
            const agg = {
              detectedEmotion: top,
              confidence: topVal,
              scores: avg,
              timestamp: payload.timestamp || Date.now(),
            };
            dispatch(setVideoResult(agg));
          } else {
            // fallback
            dispatch(setVideoResult(payload));
          }
        } catch (e) {
          dispatch(setVideoResult(payload));
        }
      } else if (modality === 'audio') dispatch(setAudioResult(payload));
      else if (modality === 'text') dispatch(setTextResult(payload));
    });

    sock.on('fused-result', (payload) => {
      if (!payload) return;
      dispatch(setFusedResult(payload));
    });
  };

  const handleStartSession = () => {
    if (!socketRef.current) handleConnect();
    const sock = getSocket();
    const clientSessionName = `session-${Date.now()}`;
    // ask server to create session
    sock.emit('start-session', { sessionName: clientSessionName });
  };

  const handleStopSession = () => {
    const sock = getSocket();
    if (sock && sessionId) {
      sock.emit('end-session', { sessionId });
    }
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
    try { stopCamera(); } catch (e) {}
    try { stopAudio(); } catch (e) {}
    // clear session and allow reconnect
    setSessionId(null);
    try { disconnectSocket(); } catch (e) {}
    setConnected(false);
    socketRef.current = null;
    // clear smoothing buffer
    videoBufferRef.current = [];
  };

  const handleStartCamera = async () => {
    await startCamera();
    // start emitting frames every 500ms when session exists
    if (!videoIntervalRef.current) {
      videoIntervalRef.current = setInterval(() => {
        const sock = getSocket();
        if (!sock) return;
        const dataUrl = capture();
        if (!dataUrl) return;
        sock.emit('video-frame', { sessionId, image: dataUrl, timestamp: Date.now() });
      }, 500);
    }
  };

  const handleStopCamera = () => {
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
    stopCamera();
  };

  const handleStartAudio = async () => {
    // use timeslice of 2000ms and onChunk callback
    const sock = getSocket();
    await startAudio((blob) => {
      // emit blob directly; socket.io supports binary
      const payload = { sessionId, timestamp: Date.now(), modality: 'audio' };
      if (sock) sock.emit('audio-chunk', { ...payload, chunk: blob });
    }, 2000);
  };

  const handleStopAudio = () => {
    stopAudio();
  };

  const handleAnalyzeText = () => {
    const sock = getSocket();
    if (!sock) return;
    const payload = { sessionId, text: textInput, timestamp: Date.now(), modality: 'text' };
    sock.emit('text-input', payload);
    setTextInput('');
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>Live Analysis</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Button variant="contained" color="primary" onClick={handleStartSession} disabled={connected}>Start Session</Button>
        <Button variant="outlined" color="secondary" onClick={handleStopSession}>End Session</Button>
        <Typography variant="body2" sx={{ ml: 2 }}>{connected ? 'Socket: connected' : 'Socket: disconnected'}</Typography>
        <Typography variant="body2" sx={{ ml: 2 }}>Session: {sessionId || '—'}</Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Text</Typography>
            <TextField value={textInput} onChange={(e) => setTextInput(e.target.value)} rows={6} multiline fullWidth placeholder="Type text to analyze" sx={{ mt: 1 }} />
            <Button variant="contained" sx={{ mt: 1 }} onClick={handleAnalyzeText}>Analyze</Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Video</Typography>
            <div style={{ width: '100%', height: 220, background: '#11101120', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video ref={videoRef} autoPlay muted playsInline style={{ maxWidth: '100%', maxHeight: 220 }} />
            </div>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {!isOn ? <Button variant="contained" onClick={handleStartCamera}>Start Camera</Button> : <Button variant="outlined" onClick={handleStopCamera}>Stop Camera</Button>}
              <Button variant="text">Capture</Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Audio</Typography>
            <div style={{ width: '100%', height: 120, background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography>{recording ? 'Recording...' : 'Idle'}</Typography>
            </div>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {!recording ? <Button variant="contained" onClick={handleStartAudio}>Record</Button> : <Button variant="outlined" onClick={handleStopAudio}>Stop</Button>}
              <Button variant="text">Upload</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Video result</Typography>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
              <EmotionBadge emotion={videoResult?.detectedEmotion} confidence={videoResult?.confidence} />
              <div>
                <Typography variant="body2">{videoResult ? `Last seen: ${new Date(videoResult.timestamp).toLocaleTimeString()}` : 'No detection yet'}</Typography>
                {videoResult?.scores && <Typography variant="caption" color="text.secondary">Top score: {Math.round((videoResult.confidence||0)*100)}%</Typography>}
              </div>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Audio result</Typography>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
              <EmotionBadge emotion={audioResult?.detectedEmotion} confidence={audioResult?.confidence} />
              <div>
                <Typography variant="body2">{audioResult ? `Last seen: ${new Date(audioResult.timestamp).toLocaleTimeString()}` : 'No detection yet'}</Typography>
                {audioResult?.scores && <Typography variant="caption" color="text.secondary">Top score: {Math.round((audioResult.confidence||0)*100)}%</Typography>}
              </div>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Text result</Typography>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
              <EmotionBadge emotion={textResult?.detectedEmotion} confidence={textResult?.confidence} />
              <div>
                <Typography variant="body2">{textResult ? `Last seen: ${new Date(textResult.timestamp).toLocaleTimeString()}` : 'No detection yet'}</Typography>
                {textResult?.text && <Typography variant="caption" color="text.secondary">"{textResult.text.length > 60 ? textResult.text.slice(0, 57) + '...' : textResult.text}"</Typography>}
              </div>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Fused result</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between">
              <div>
                <Typography variant="h4" sx={{ mt: 1 }}>{fused ? `${EMOTION_EMOJIS[fused.finalEmotion] || ''} ${fused.finalEmotion}` : '—'}</Typography>
                <Typography variant="body2" color="text.secondary">{fused ? `Confidence: ${Math.round((fused.confidence||0)*100)}%` : ''}</Typography>
              </div>
              <Button variant="outlined">Export Session</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default LiveAnalysis;
