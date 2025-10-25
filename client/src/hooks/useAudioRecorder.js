import { useState, useRef } from 'react';

export default function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  /**
   * start(onChunk, timeslice)
   * - onChunk: optional callback(blob) invoked each time dataavailable fires
   * - timeslice: number ms to pass to mediaRecorder.start(timeslice) to get periodic chunks
   */
  const start = async (onChunk = null, timeslice = 0) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        // push chunk
        audioChunksRef.current.push(e.data);
        // call chunk callback immediately if provided
        if (typeof onChunk === 'function') {
          try {
            onChunk(e.data);
          } catch (err) {
            console.error('onChunk callback error', err);
          }
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      if (timeslice && typeof timeslice === 'number' && timeslice > 0) {
        mediaRecorderRef.current.start(timeslice);
      } else {
        mediaRecorderRef.current.start();
      }

      setRecording(true);
    } catch (err) {
      setError(err);
    }
  };

  const stop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const getBlob = () => {
    return new Blob(audioChunksRef.current, { type: 'audio/webm' });
  };

  return { recording, audioUrl, error, start, stop, getBlob };
}
