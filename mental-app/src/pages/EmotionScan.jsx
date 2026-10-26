import { useState, useRef, useCallback, useEffect } from 'react';
import { emotionService, moodService } from '../services/api';
import './EmotionScan.css';

const EMOTIONS = {
  happy:    { emoji: '😊', label: 'Happy',    color: '#f59e0b', bg: '#fffbeb', tip: 'Your happiness is shining! Share this energy with someone you care about.' },
  sad:      { emoji: '😢', label: 'Sad',      color: '#3b82f6', bg: '#eff6ff', tip: "It's okay to feel sad. Try journaling your thoughts or taking a slow walk." },
  angry:    { emoji: '😠', label: 'Angry',    color: '#ef4444', bg: '#fef2f2', tip: 'Take 5 deep breaths. Physical exercise is also great for releasing tension.' },
  fear:     { emoji: '😨', label: 'Fear',     color: '#8b5cf6', bg: '#f5f3ff', tip: "You're safe. Try the breathing exercise — it helps calm the nervous system." },
  surprise: { emoji: '😲', label: 'Surprise', color: '#f97316', bg: '#fff7ed', tip: 'Take a moment to ground yourself. Notice 5 things you can see around you.' },
  disgust:  { emoji: '🤢', label: 'Disgust',  color: '#22c55e', bg: '#f0fdf4', tip: 'Step back from whatever is bothering you and try a short mindfulness break.' },
  neutral:  { emoji: '😐', label: 'Neutral',  color: '#94a3b8', bg: '#f8fafc', tip: "A calm moment. Great time to log your mood or set a small goal for today." },
};

const EMOTION_TO_MOOD = {
  happy: 5, surprise: 4, neutral: 3, fear: 2, sad: 2, disgust: 1, angry: 1,
};

const getMeta = (key) => EMOTIONS[key] || EMOTIONS.neutral;

export default function EmotionScan() {
  const [preview, setPreview]       = useState(null);
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [moodMsg, setMoodMsg]       = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [camOpen, setCamOpen]       = useState(false);
  const [camReady, setCamReady]     = useState(false);
  const [countdown, setCountdown]   = useState(null);

  const [liveResult,  setLiveResult]  = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);

  const fileRef         = useRef(null);
  const videoRef        = useRef(null);
  const canvasRef       = useRef(null);
  const streamRef       = useRef(null);
  const liveIntervalRef = useRef(null);
  const liveActiveRef   = useRef(false);

  // Stop live detection loop
  const stopLive = useCallback(() => {
    liveActiveRef.current = false;
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
    setLiveResult(null);
    setLiveLoading(false);
  }, []);

  // Stop webcam stream
  const stopStream = useCallback(() => {
    stopLive();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCamReady(false);
    setCamOpen(false);
    setCountdown(null);
  }, [stopLive]);

  // Open webcam
  const openCamera = useCallback(async () => {
    setError(null);
    setCamOpen(true);
    setCamReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCamReady(true);
        };
      }
    } catch (err) {
      stopStream();
      setError('Camera access denied. Please allow camera permission in your browser, then try again.');
    }
  }, [stopStream]);

  // Capture frame from video
  const capturePhoto = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreview(dataUrl);
    stopStream();
    analyzeBase64(dataUrl.split(',')[1]);
  }, [stopStream]); // eslint-disable-line

  // Countdown then snap
  const startCountdown = useCallback(() => {
    let n = 3;
    setCountdown(n);
    const id = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(id);
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(n);
      }
    }, 1000);
  }, [capturePhoto]);

  // Capture one frame silently for live detection
  const captureLiveFrame = useCallback(async () => {
    if (!liveActiveRef.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];

    setLiveLoading(true);
    try {
      const data = await emotionService.predict(base64);
      if (liveActiveRef.current) setLiveResult(data);
    } catch {
      // silently ignore live failures
    } finally {
      if (liveActiveRef.current) setLiveLoading(false);
    }
  }, []);

  // Start live detection once camera is ready
  useEffect(() => {
    if (camReady) {
      liveActiveRef.current = true;
      captureLiveFrame();
      liveIntervalRef.current = setInterval(captureLiveFrame, 1800);
    } else {
      stopLive();
    }
    return () => stopLive();
  }, [camReady, captureLiveFrame, stopLive]);

  // Cleanup on unmount
  useEffect(() => () => stopStream(), [stopStream]);

  // Attach stream to video after camOpen
  useEffect(() => {
    if (camOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [camOpen]);

  const analyzeBase64 = useCallback(async (base64) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setMoodMsg(null);
    try {
      const data = await emotionService.predict(base64);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Make sure the AI server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError(null);
    setResult(null);
    setMoodMsg(null);
    const b64Reader = new FileReader();
    b64Reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      analyzeBase64(dataUrl.split(',')[1]);
    };
    b64Reader.readAsDataURL(file);
  }, [analyzeBase64]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) analyzeFile(file);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) analyzeFile(file);
  };

  const handleLogMood = async () => {
    if (!result) return;
    const value = EMOTION_TO_MOOD[result.emotion] || 3;
    const meta  = getMeta(result.emotion);
    try {
      await moodService.log(value, `Emotion scan: ${result.emotion} (${Math.round(result.confidence * 100)}% confidence)`);
      setMoodMsg(`${meta.emoji} "${meta.label}" logged to your mood history!`);
    } catch {
      setMoodMsg('Could not save mood. Please try again.');
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    setMoodMsg(null);
    stopStream();
  };

  const meta = result ? getMeta(result.emotion) : null;
  const sortedScores = result?.scores
    ? Object.entries(result.scores).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="scan-page">
      {/* Webcam modal */}
      {camOpen && (
        <div className="cam-modal-bg" onClick={(e) => { if (e.target === e.currentTarget) stopStream(); }}>
          <div className="cam-modal">
            <div className="cam-header">
              <span>📷 Webcam</span>
              <button className="cam-close" onClick={stopStream}>✕</button>
            </div>
            <div
              className="cam-video-wrap"
              style={liveResult ? { outline: `3px solid ${getMeta(liveResult.emotion).color}`, outlineOffset: '-3px' } : {}}
            >
              <video ref={videoRef} className="cam-video" autoPlay playsInline muted />

              {!camReady && (
                <div className="cam-loading">
                  <div className="scan-spinner" />
                  <span>Starting camera…</span>
                </div>
              )}

              {/* Live emotion overlay */}
              {camReady && liveResult && countdown === null && (() => {
                const m = getMeta(liveResult.emotion);
                return (
                  <div className="live-overlay" style={{ background: `${m.color}cc`, borderTop: `2px solid ${m.color}` }}>
                    <span className="live-emoji">{m.emoji}</span>
                    <span className="live-label">{m.label}</span>
                    <span className="live-conf">{Math.round(liveResult.confidence * 100)}%</span>
                    {liveLoading && <span className="live-pulse" />}
                  </div>
                );
              })()}

              {/* Scanning pulse when no result yet */}
              {camReady && !liveResult && liveLoading && (
                <div className="live-overlay live-overlay--scanning">
                  <div className="scan-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  <span style={{ fontSize: '0.8rem', color: '#fff' }}>Scanning…</span>
                </div>
              )}

              {countdown !== null && (
                <div className="cam-countdown">{countdown}</div>
              )}
            </div>
            <div className="cam-footer">
              <button
                className="cam-snap-btn"
                onClick={startCountdown}
                disabled={!camReady || countdown !== null}
              >
                {countdown !== null ? `📸 ${countdown}…` : '📸 Take Photo'}
              </button>
              <button className="cam-instant-btn" onClick={capturePhoto} disabled={!camReady || countdown !== null}>
                Instant
              </button>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {/* Header */}
      <div className="scan-header">
        <div className="scan-header-inner">
          <span className="scan-header-emoji">🧠</span>
          <h1>Face Emotion Scan</h1>
          <p>AI-powered emotion recognition using MobileNetV3</p>
        </div>
      </div>

      <div className="scan-content">

        {/* Upload Card */}
        <div className="scan-card upload-card">
          {preview ? (
            <div className="preview-wrap">
              <img src={preview} alt="Preview" className="preview-img" />
              {loading && (
                <div className="scan-overlay">
                  <div className="scan-spinner" />
                  <span>Analyzing face…</span>
                </div>
              )}
              {!loading && (
                <button className="reset-btn" onClick={reset} title="Try another photo">✕</button>
              )}
            </div>
          ) : (
            <div
              className={`drop-zone ${dragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <span className="drop-emoji">🤳</span>
              <p className="drop-title">Drop a photo here or click to upload</p>
              <p className="drop-sub">Your face will be analyzed by the AI model</p>
            </div>
          )}

          <div className="upload-btns">
            <button className="upload-btn camera-btn" onClick={openCamera} disabled={loading}>
              📷 Camera
            </button>
            <button className="upload-btn gallery-btn" onClick={() => fileRef.current?.click()} disabled={loading}>
              🖼️ Gallery
            </button>
          </div>

          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
        </div>

        {/* Error */}
        {error && <div className="scan-card error-card">⚠️ {error}</div>}

        {/* Result */}
        {result && meta && !loading && (
          <>
            <div className="scan-card result-card" style={{ background: `linear-gradient(135deg, ${meta.color}33, ${meta.color}99)`, borderColor: meta.color + '66' }}>
              <span className="result-emoji">{meta.emoji}</span>
              <h2 className="result-label" style={{ color: meta.color }}>{meta.label}</h2>
              <p className="result-conf">{Math.round(result.confidence * 100)}% confidence</p>
              {!result.face_detected && (
                <span className="no-face-badge">⚠️ No face detected — used full image</span>
              )}
            </div>

            <div className="scan-card tip-card" style={{ background: meta.bg, borderColor: meta.color + '44' }}>
              <span>💡</span>
              <p style={{ color: meta.color }}>{meta.tip}</p>
            </div>

            <div className="scan-card breakdown-card">
              <h3>Emotion Breakdown</h3>
              {sortedScores.map(([emotion, score], i) => {
                const m = getMeta(emotion);
                const pct = Math.round(score * 100);
                return (
                  <div key={emotion} className="score-row">
                    <span className="score-emoji">{m.emoji}</span>
                    <span className="score-label">{m.label}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${pct}%`, background: i === 0 ? m.color : '#334155' }} />
                    </div>
                    <span className="score-pct" style={{ color: i === 0 ? m.color : '#64748b', fontWeight: i === 0 ? 700 : 400 }}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="result-actions">
              <button className="log-btn" style={{ background: meta.color }} onClick={handleLogMood}>
                ❤️ Log This Mood
              </button>
              <a href="/breathe" className="breathe-btn">🌬️ Breathe</a>
            </div>

            {moodMsg && <div className="mood-toast">{moodMsg}</div>}
          </>
        )}

        {/* Info cards */}
        {!result && !loading && (
          <>
            <div className="scan-card info-card">
              <h3>How it works</h3>
              <ul className="info-list">
                <li><span>📸</span> Take a selfie with your webcam or upload a photo</li>
                <li><span>🔍</span> OpenCV detects your face automatically</li>
                <li><span>🤖</span> MobileNetV3 classifies your emotion (66% accuracy)</li>
                <li><span>❤️</span> Log it directly to your mood tracker</li>
              </ul>
            </div>

            <div className="scan-card emotions-card">
              <h3>7 Emotions Detected</h3>
              <div className="emotion-chips">
                {Object.entries(EMOTIONS).map(([key, val]) => (
                  <span key={key} className="emotion-chip" style={{ background: val.bg, borderColor: val.color + '66', color: val.color }}>
                    {val.emoji} {val.label}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
