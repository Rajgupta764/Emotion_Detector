// Mock ML service for text/audio/video. Returns random but consistent-looking emotion scores.
const EMOTIONS = ['happy','sad','angry','fear','surprise','disgust','neutral'];

function pickEmotion(scores) {
  let max = -1, idx = 0;
  scores.forEach((s,i)=>{ if(s>max){max=s; idx=i} });
  return EMOTIONS[idx];
}

function normalize(arr){
  const s = arr.reduce((a,b)=>a+b,0)||1;
  return arr.map(x=>x/s);
}

exports.analyzeText = async (text) => {
  // simplistic mapping: presence of keywords
  const lower = (text||'').toLowerCase();
  const scores = EMOTIONS.map(() => Math.random()*0.6 + 0.1);
  if (lower.includes('happy') || lower.includes('love') || lower.includes('great')) scores[0] += 0.8;
  if (lower.includes('sad') || lower.includes('unhappy') || lower.includes('sorry')) scores[1] += 0.8;
  if (lower.includes('angry') || lower.includes('hate') || lower.includes('annoy')) scores[2] += 0.8;
  const norm = normalize(scores);
  const detected = pickEmotion(norm);
  const confidence = Math.max(...norm);
  return { modality: 'text', text, detectedEmotion: detected, confidence, scores: { happy: norm[0], sad: norm[1], angry: norm[2], fear: norm[3], surprise: norm[4], disgust: norm[5], neutral: norm[6] } };
};

exports.analyzeAudioChunk = async (chunkBuffer) => {
  // mock analyze: random with slight bias
  const scores = EMOTIONS.map(() => Math.random()*0.6 + 0.1);
  const norm = normalize(scores);
  const detected = pickEmotion(norm);
  const confidence = Math.max(...norm);
  return { modality: 'audio', detectedEmotion: detected, confidence, scores: { happy: norm[0], sad: norm[1], angry: norm[2], fear: norm[3], surprise: norm[4], disgust: norm[5], neutral: norm[6] } };
};

exports.analyzeImage = async (path) => {
  const scores = EMOTIONS.map(() => Math.random()*0.6 + 0.1);
  const norm = normalize(scores);
  const detected = pickEmotion(norm);
  const confidence = Math.max(...norm);
  return { modality: 'video', detectedEmotion: detected, confidence, scores: { happy: norm[0], sad: norm[1], angry: norm[2], fear: norm[3], surprise: norm[4], disgust: norm[5], neutral: norm[6] } };
};
