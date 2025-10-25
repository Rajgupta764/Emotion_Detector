import React from 'react';
import { EMOTION_COLORS, EMOTION_EMOJIS } from '../../utils/emotionColors';

const EmotionBadge = ({ emotion, confidence }) => {
  const color = EMOTION_COLORS[emotion] || '#9e9e9e';
  const emoji = EMOTION_EMOJIS[emotion] || '';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', padding: '6px 10px', borderRadius: 20, border: `1px solid ${color}` }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <strong style={{ color }}>{emotion || '—'}</strong>
        {typeof confidence === 'number' && <small style={{ color: '#666' }}>{Math.round(confidence * 100)}%</small>}
      </div>
    </div>
  );
};

export default EmotionBadge;
