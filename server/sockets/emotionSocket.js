const Session = require('../models/Session');
const EmotionLog = require('../models/EmotionLog');
const mlService = require('../services/mlService');
const fusion = require('../services/fusionService');

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);
    // in-memory store for per-session latest modality results
    // note: for a production system, persist or use a proper store
    if (!io.sessionState) io.sessionState = {};

    socket.on('start-session', async (payload) => {
      try {
        const session = new Session({ sessionName: payload.sessionName || `session-${Date.now()}`, modalities: [] });
        await session.save();
        socket.join(session._id.toString());
        socket.sessionId = session._id.toString();
        socket.emit('session-created', { sessionId: session._id.toString() });
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Could not create session' });
      }
    });

    socket.on('video-frame', async (data) => {
      try {
        // data: { sessionId, image, timestamp }
        const result = await mlService.analyzeImage(data.image);
        // save log
        if (data.sessionId) {
          const log = new EmotionLog({ sessionId: data.sessionId, timestamp: new Date(data.timestamp||Date.now()), modality: 'video', input: 'frame', detectedEmotion: result.detectedEmotion, confidence: result.confidence, emotionScores: result.scores });
          await log.save();
          // update in-memory state
          if (!io.sessionState[data.sessionId]) io.sessionState[data.sessionId] = {};
          io.sessionState[data.sessionId].video = result;
          // compute fused using latest modalities
          const fusedAll = fusion.fuseEmotions(io.sessionState[data.sessionId].text || null, io.sessionState[data.sessionId].audio || null, io.sessionState[data.sessionId].video || null);
          if (fusedAll) {
            socket.emit('fused-result', fusedAll);
            // also persist fused in session document if exists
            try {
              const sess = await Session.findById(data.sessionId);
              if (sess) {
                sess.results = { finalEmotion: fusedAll.finalEmotion, confidence: fusedAll.confidence, emotionBreakdown: fusedAll.breakdown };
                await sess.save();
              }
            } catch (e) { /* ignore */ }
          }
        }
        socket.emit('emotion-result', { ...result, modality: 'video', timestamp: Date.now() });
      } catch (err) {
        console.error('video-frame error', err);
      }
    });

    socket.on('audio-chunk', async (data) => {
      try {
        // data: { sessionId, timestamp, chunk }
        // chunk may be binary blob; here we ignore content and call mock
        const result = await mlService.analyzeAudioChunk(data.chunk);
        if (data.sessionId) {
          const log = new EmotionLog({ sessionId: data.sessionId, timestamp: new Date(data.timestamp||Date.now()), modality: 'audio', input: 'chunk', detectedEmotion: result.detectedEmotion, confidence: result.confidence, emotionScores: result.scores });
          await log.save();
          if (!io.sessionState[data.sessionId]) io.sessionState[data.sessionId] = {};
          io.sessionState[data.sessionId].audio = result;
          const fusedAll = fusion.fuseEmotions(io.sessionState[data.sessionId].text || null, io.sessionState[data.sessionId].audio || null, io.sessionState[data.sessionId].video || null);
          if (fusedAll) {
            socket.emit('fused-result', fusedAll);
            try {
              const sess = await Session.findById(data.sessionId);
              if (sess) {
                sess.results = { finalEmotion: fusedAll.finalEmotion, confidence: fusedAll.confidence, emotionBreakdown: fusedAll.breakdown };
                await sess.save();
              }
            } catch (e) {}
          }
        }
        socket.emit('emotion-result', { ...result, modality: 'audio', timestamp: Date.now() });
        
      } catch (err) {
        console.error('audio-chunk error', err);
      }
    });

    socket.on('text-input', async (data) => {
      try {
        const result = await mlService.analyzeText(data.text);
        if (data.sessionId) {
          const log = new EmotionLog({ sessionId: data.sessionId, timestamp: new Date(data.timestamp||Date.now()), modality: 'text', input: data.text, detectedEmotion: result.detectedEmotion, confidence: result.confidence, emotionScores: result.scores });
          await log.save();
          if (!io.sessionState[data.sessionId]) io.sessionState[data.sessionId] = {};
          io.sessionState[data.sessionId].text = result;
          const fusedAll = fusion.fuseEmotions(io.sessionState[data.sessionId].text || null, io.sessionState[data.sessionId].audio || null, io.sessionState[data.sessionId].video || null);
          if (fusedAll) {
            socket.emit('fused-result', fusedAll);
            try {
              const sess = await Session.findById(data.sessionId);
              if (sess) {
                sess.results = { finalEmotion: fusedAll.finalEmotion, confidence: fusedAll.confidence, emotionBreakdown: fusedAll.breakdown };
                await sess.save();
              }
            } catch (e) {}
          }
        }
        socket.emit('emotion-result', { ...result, modality: 'text', timestamp: Date.now() });
      } catch (err) {
        console.error('text-input error', err);
      }
    });

    socket.on('end-session', async (data) => {
      try {
        const sid = data.sessionId || socket.sessionId;
        if (!sid) return;
        const session = await Session.findById(sid);
        if (session) {
          session.endTime = new Date();
          session.duration = (session.endTime - session.startTime);
          // attach final fused if available
          if (io.sessionState && io.sessionState[sid]) {
            const sstate = io.sessionState[sid];
            const fusedAll = fusion.fuseEmotions(sstate.text || null, sstate.audio || null, sstate.video || null);
            if (fusedAll) session.results = { finalEmotion: fusedAll.finalEmotion, confidence: fusedAll.confidence, emotionBreakdown: fusedAll.breakdown };
            // cleanup state
            delete io.sessionState[sid];
          }
          await session.save();
        }
        socket.emit('session-ended', { sessionId: sid });
      } catch (err) {
        console.error('end-session error', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected', socket.id);
    });
  });
};
