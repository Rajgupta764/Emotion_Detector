const mongoose = require('mongoose');

const EmotionLogSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  timestamp: { type: Date, default: Date.now },
  modality: { type: String },
  input: { type: String },
  detectedEmotion: { type: String },
  confidence: { type: Number },
  emotionScores: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('EmotionLog', EmotionLogSchema);
