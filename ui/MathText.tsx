import React, { useEffect, useRef } from 'react';

interface MathTextProps {
  text: string;
  className?: string;
}

// Lightweight MathJax v3 renderer. Requires MathJax script present in index.html
export const MathText: React.FC<MathTextProps> = ({ text, className }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = text
      .replace(/\n/g, '<br/>');
    // @ts-ignore
    const mj = (window as any).MathJax;
    if (mj?.typesetPromise) {
      mj.typesetPromise([el]).catch(() => {});
    }
  }, [text]);

  return <div ref={ref} className={className} aria-label="math-content" />;
};


