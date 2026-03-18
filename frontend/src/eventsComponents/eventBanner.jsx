import React, { useEffect, useRef, useState } from "react";
import "./eventBanner.css";

const EventBanner = () => {
  const bannerRef = useRef(null);
  const [showText, setShowText] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e) => {
    const rect = bannerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    bannerRef.current.style.setProperty("--rx", `${y * 8}deg`);
    bannerRef.current.style.setProperty("--ry", `${-x * 8}deg`);
  };

  const handleClick = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
  };

  return (
    <section
      ref={bannerRef}
      className={`navratri-mandala ${pulse ? "pulse" : ""}`}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Mandala SVG */}
      <div className="mandala-wrapper">
        <svg viewBox="0 0 200 200" className="mandala">
          {/* ✅ Gradient FIX */}
          <defs>
            <linearGradient id="grad" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff9a00" />
              <stop offset="50%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#ff3c00" />
            </linearGradient>
          </defs>

          {[...Array(10)].map((_, i) => (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={5 + i * 8}
              className="mandala-ring"
              style={{
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Glow layer */}
      <div className="mandala-glow"></div>

      <img
        src="/diya.png" 
        alt="Left hand"
        className="diya-img left"
      />

      <img
        src="/flower.png" 
        alt="Right hand"
        className="diya-img right"
      />

      {showText && (
        <div className="content text-center px-4">
          <h1 className="title">Happy Navratri</h1>

          <p className="subtitle absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
            Get <span className="categories" >Fresh Fruits & Pooja Essentials</span> on <span className="font-semibold text-amber-600">GullyFoods</span>.
          </p>
        </div>
      )}
    </section>
  );
};

export default EventBanner;
