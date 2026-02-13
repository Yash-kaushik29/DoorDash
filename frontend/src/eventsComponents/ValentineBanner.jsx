import React from "react";
import '../index.css'

const ValentineBanner = () => {
  return (
    <section className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-[#FF758C] via-[#FF7EB3] to-[#FFC3A0] px-4 pt-3 pb-6 text-white">
      {/* Floating Hearts */}
      {[...Array(16)].map((_, i) => (
        <span
          key={i}
          className="floating-heart text-red-500"
          style={{
            left: `${Math.random() * 100}%`,
            fontSize: `${10 + Math.random() * 14}px`,
            animationDuration: `${6 + Math.random() * 6}s`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        >
          ❤️
        </span>
      ))}

      {/* Text */}
      <div className="relative text-center mb-2 z-10">
        <h1 className="text-lg sm:text-xl font-extrabold tracking-wide">
          This Valentine,
        </h1>
        <p className="text-base sm:text-lg font-semibold mt-1">
          <span className="opacity-90">GF</span> stands for{" "}
          <span className="text-lg font-extrabold text-red-600">GullyFoods</span> 💘
        </p>
        <p className="text-xs opacity-90 mt-1">
          Little surprises that say a lot ❤️
        </p>
      </div>
    </section>
  );
};

export default ValentineBanner;
