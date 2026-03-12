import { useState, useEffect, useRef } from 'react';

interface Props {
  lines: string[];
  /** Delay before bubble appears (ms) */
  delay?: number;
  /** How long the bubble stays after typing finishes (ms) */
  displayDuration?: number;
  /** Typing speed (ms per character) */
  typeSpeed?: number;
}

export default function SpeechBubble({ lines, delay = 2000, displayDuration = 6000, typeSpeed = 35 }: Props) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const lineRef = useRef('');

  useEffect(() => {
    // Pick a random line
    lineRef.current = lines[Math.floor(Math.random() * lines.length)];

    const showTimer = setTimeout(() => {
      setVisible(true);
      let i = 0;
      const typeInterval = setInterval(() => {
        i++;
        setText(lineRef.current.slice(0, i));
        if (i >= lineRef.current.length) {
          clearInterval(typeInterval);
          setDone(true);
        }
      }, typeSpeed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(showTimer);
  }, []);

  // Hide after display duration once typing is done
  useEffect(() => {
    if (!done) return;
    const hideTimer = setTimeout(() => setVisible(false), displayDuration);
    return () => clearTimeout(hideTimer);
  }, [done, displayDuration]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: -8,
      right: -8,
      transform: 'translateY(-100%)',
      maxWidth: 220,
      padding: '8px 12px',
      borderRadius: 10,
      borderBottomRightRadius: 2,
      backgroundColor: 'rgba(30, 30, 45, 0.95)',
      border: '1px solid rgba(121, 134, 203, 0.25)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#c8c8d8',
      animation: 'bubbleFadeIn 0.3s ease',
      zIndex: 10,
    }}>
      {text}
      {!done && <span style={{ opacity: 0.5, animation: 'blink 0.6s infinite' }}>|</span>}
    </div>
  );
}
