import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor({ text = 'VIEW' }) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const cursorRef = useRef(null);

  useEffect(() => {
    // Only run on desktop devices with fine pointer
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let requestID;

    const handleMouseMove = (e) => {
      // Hide over form controls / inputs
      const target = e.target;
      const isInput = target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' || 
        target.tagName === 'BUTTON' ||
        target.isContentEditable
      );

      if (isInput) {
        setIsVisible(false);
        return;
      }

      setIsVisible(true);
      cancelAnimationFrame(requestID);

      requestID = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(requestID);
    };
  }, []);

  return (
    <div 
      ref={cursorRef}
      className="dc-cursor-follower"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
        opacity: isVisible ? 1 : 0,
        pointerEvents: 'none'
      }}
    >
      {text}
    </div>
  );
}

