import React from 'react';
import { useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mapEmotionToValue = (emotion) => {
  const map = { happy: 6, sad: 2, angry: 1, fear: 0, surprise: 5, disgust: 3, neutral: 4 };
  return map[emotion] || 0;
};

const EmotionTimeline = ({ width = '100%', height = 160 }) => {
  const history = useSelector((s) => s.emotion.emotionHistory || []);
  // take last 50
  const data = history.slice(-50).map((h, idx) => ({
    time: new Date(h.timestamp || Date.now()).toLocaleTimeString(),
    val: mapEmotionToValue(h.detectedEmotion),
    label: h.detectedEmotion,
  }));

  if (data.length === 0) return <div style={{ height }}>No timeline data yet</div>;

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis domain={[0, 6]} hide />
          <Tooltip formatter={(v, name, props) => [props.payload.label, 'emotion']} />
          <Line type="monotone" dataKey="val" stroke="#8884d8" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionTimeline;
