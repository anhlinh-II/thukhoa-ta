"use client";
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import loadingService from '../../services/loadingService';

export interface GlobalLoaderProps {
  /** When true the loader won't render (opt-out) */
  disabled?: boolean;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({ disabled }) => {
  const [count, setCount] = useState(0);
  const [hasLottie, setHasLottie] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = loadingService.subscribe((c) => setCount(c));
    return () => { unsub && unsub(); };
  }, []);

  useEffect(() => {
    // check if /loader.lottie exists to avoid 404 noise
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch('/loader.lottie', { method: 'HEAD' });
        if (!mounted) return;
        setHasLottie(resp.ok);
      } catch (e) {
        if (!mounted) return;
        setHasLottie(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (disabled) return null;
  if (typeof document === 'undefined') return null;
  if (count <= 0) return null;

  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="rounded-lg bg-white/90 p-8 flex flex-col items-center justify-center shadow-lg">
        {hasLottie === null ? (
          // still checking, show simple fallback spinner
          <div className="fancy-loader">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : hasLottie ? (
          <div style={{ width: 160, height: 160 }}>
            <DotLottieReact src="/loader.lottie" loop autoplay />
          </div>
        ) : (
          // fallback CSS loader
          <div className="fancy-loader">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
};

export default GlobalLoader;
