import { useRef, useState, useEffect } from 'react';

export default function useWebcam({ facingMode = 'user' } = {}) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setIsOn(true);
    } catch (err) {
      setError(err);
    }
  };

  const stop = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setIsOn(false);
  };

  const capture = (mime = 'image/png') => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(mime);
  };

  return { videoRef, start, stop, isOn, capture, error };
}
