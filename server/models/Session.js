const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  // friendly unique session id to avoid duplicate-null index issues
  sessionId: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionName: { type: String },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number },
  modalities: [{ type: String }],
  results: {
    finalEmotion: String,
    confidence: Number,
    emotionBreakdown: Object,
  },
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
