// Simple fusion: use confidences as weights; if missing, use equal weights
exports.fuseEmotions = (textResult, audioResult, videoResult) => {
  const modalities = [textResult, audioResult, videoResult].filter(Boolean);
  if (modalities.length === 0) return null;

  // gather scores
  const emotions = ['happy','sad','angry','fear','surprise','disgust','neutral'];
  const agg = {};
  emotions.forEach(e => agg[e] = 0);

  // compute weights from confidence (min 0.1)
  const weights = modalities.map(m => Math.max(0.1, (m.confidence || 0.2)));
  const wsum = weights.reduce((a,b)=>a+b,0)||1;

  modalities.forEach((m, idx) => {
    const w = weights[idx]/wsum;
    const scores = m.scores || {};
    emotions.forEach(e => { agg[e] += (scores[e] || 0) * w; });
  });

  // pick max
  let max = -1, winner = 'neutral';
  emotions.forEach(e => { if (agg[e] > max) { max = agg[e]; winner = e; } });

  return {
    finalEmotion: winner,
    confidence: max,
    breakdown: agg,
    weights: modalities.map((m,idx)=>({ modality: m.modality || 'unknown', weight: weights[idx]/wsum }))
  };
};
