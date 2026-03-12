import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  lines: string[];
  /** Delay before first bubble (ms) */
  delay?: number;
  /** Interval between new lines (ms) */
  interval?: number;
  /** How long the bubble stays visible after typing (ms) */
  displayDuration?: number;
  /** Typing speed (ms per character) */
  typeSpeed?: number;
}

export default function SpeechBubble({ lines, delay = 3000, interval = 8000, displayDuration = 3500, typeSpeed = 25 }: Props) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const usedRef = useRef<Set<number>>(new Set());
  const typeRef = useRef<number>(0);

  const pickLine = useCallback(() => {
    if (usedRef.current.size >= lines.length) usedRef.current.clear();
    let idx: number;
    do { idx = Math.floor(Math.random() * lines.length); } while (usedRef.current.has(idx));
    usedRef.current.add(idx);
    return lines[idx];
  }, [lines]);

  const showLine = useCallback(() => {
    const line = pickLine();
    setText('');
    setTyping(true);
    setVisible(true);

    let i = 0;
    if (typeRef.current) clearInterval(typeRef.current);
    typeRef.current = window.setInterval(() => {
      i++;
      setText(line.slice(0, i));
      if (i >= line.length) {
        clearInterval(typeRef.current);
        setTyping(false);
        setTimeout(() => setVisible(false), displayDuration);
      }
    }, typeSpeed);
  }, [pickLine, displayDuration, typeSpeed]);

  useEffect(() => {
    const initialTimer = setTimeout(showLine, delay);
    const cycleTimer = setInterval(showLine, interval);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(cycleTimer);
      if (typeRef.current) clearInterval(typeRef.current);
    };
  }, [showLine, delay, interval]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '100%',
      left: '60%',
      marginBottom: 10,
      whiteSpace: 'nowrap',
      padding: '7px 14px',
      borderRadius: 10,
      background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.15), rgba(171, 71, 188, 0.12))',
      border: '1px solid rgba(121, 134, 203, 0.3)',
      boxShadow: '0 0 20px rgba(108, 99, 255, 0.15), 0 4px 16px rgba(0,0,0,0.4)',
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#c4b5fd',
      textShadow: '0 0 8px rgba(167, 139, 250, 0.6)',
      fontWeight: 500,
      letterSpacing: '0.01em',
      animation: 'bubbleFadeIn 0.3s ease',
      zIndex: 10,
    }}>
      {text}
      {typing && <span style={{ opacity: 0.6, animation: 'blink 0.6s infinite' }}>|</span>}
      {/* Triangle arrow pointing down — uses CSS borders, overlaps box by 1px */}
      <div style={{
        position: 'absolute',
        top: 'calc(100% - 1px)',
        left: 24,
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '8px solid rgba(121, 134, 203, 0.3)',
      }} />
      <div style={{
        position: 'absolute',
        top: 'calc(100% - 2.5px)',
        left: 25,
        width: 0,
        height: 0,
        borderLeft: '7px solid transparent',
        borderRight: '7px solid transparent',
        borderTop: '7px solid rgba(40, 36, 70, 0.95)',
      }} />
    </div>
  );
}
