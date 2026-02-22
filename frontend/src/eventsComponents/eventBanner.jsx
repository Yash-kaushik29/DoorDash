import React, { useEffect, useState, useRef } from "react";
import "./eventBanner.css";

const splashImages = [
  "/red.png",
  "/yellow.png",
  "/blue.png",
  "/green.png",
  "/orange.png",
  "/purple.png",
];

const EventBanner = () => {
  const [showText, setShowText] = useState(false);
  const [clickSplashes, setClickSplashes] = useState([]);
  const bannerRef = useRef(null);

  // text after intro
  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 1600);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e) => {
    const rect = bannerRef.current.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    bannerRef.current.style.setProperty("--px", `${x * 30}px`);
    bannerRef.current.style.setProperty("--py", `${y * 30}px`);
  };

  const handleClick = (e) => {
    const rect = bannerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const splash = {
      id: Date.now(),
      x,
      y,
      img: splashImages[Math.floor(Math.random() * splashImages.length)],
      size: Math.random() * 80 + 60,
      rotate: Math.random() * 360,
    };

    setClickSplashes((prev) => [...prev, splash]);

    setTimeout(() => {
      setClickSplashes((prev) => prev.filter((s) => s.id !== splash.id));
    }, 1400);
  };

  return (
    <section
      className="holi-intro"
      ref={bannerRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* haze */}
      <div className="color-haze"></div>

      {/* grain */}
      <div className="grain"></div>

      {/* vignette */}
      <div className="vignette"></div>

      {/* intro burst */}
      <div className="intro-burst">
        {[...Array(12)].map((_, i) => {
          const img = splashImages[i % splashImages.length];
          return (
            <img
              key={i}
              alt="splash"
              src={img}
              className="burst-splash"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 60 + 30}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animationDelay: `${i * 0.06}s`,
              }}
            />
          );
        })}
      </div>

      {showText && (
        <div className="flex flex-col gap-2">
          <h1 className="holi-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
            Happy Holi 
          </h1>{" "}
          <p className="text-gray-800 font-semibold">
            Celebrate Holi with GullyFoods
          </p>
        </div>
      )}

      {clickSplashes.map((s) => (
        <img
          key={s.id}
          src={s.img}
          alt="splash"
          className="click-splash"
          style={{
            top: s.y,
            left: s.x,
            width: s.size,
            transform: `translate(-50%, -50%) rotate(${s.rotate}deg)`,
          }}
        />
      ))}
    </section>
  );
};

export default EventBanner;
