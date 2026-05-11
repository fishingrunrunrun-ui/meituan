import { useEffect, useRef, useState } from 'react';

const PHONE_W = 393;
const PHONE_H = 852;

export default function PhoneFrame({ children }) {
  const [scale, setScale] = useState(1);
  const rafRef = useRef(null);

  useEffect(() => {
    function compute() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Leave 12px padding on each side
      const pad = 12;
      const availW = vw - pad * 2;
      const availH = vh - pad * 2;
      const s = Math.min(availW / PHONE_W, availH / PHONE_H, 1);
      setScale(s);
    }

    compute();

    function onResize() {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(compute);
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: PHONE_W,
        height: PHONE_H,
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
