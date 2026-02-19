import React from "react";
import "../index.css";

const EventBanner = () => {
  return (
    <section className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-[#0F3D2E] via-[#14532D] to-[#1E293B] px-4 pt-10 pb-8 text-white">

      {/* LEFT — Longest */}
      <div
        className="lantern-wrapper lantern-glow"
        style={{ left: "10%", animationDuration: "5.5s" }}
      >
        <div
          className="lantern-thread"
          style={{ height: "80px" }}   // 👈 longest
        ></div>
        <div className="text-yellow-300 text-3xl text-center">🏮</div>
      </div>

      {/* MIDDLE — Shortest */}
      <div
        className="lantern-wrapper lantern-glow"
        style={{ left: "30%", animationDuration: "6s" }}
      >
        <div
          className="lantern-thread"
          style={{ height: "40px" }}   // 👈 shortest
        ></div>
        <div className="text-yellow-300 text-4xl text-center">🏮</div>
      </div>

      <div
        className="lantern-wrapper lantern-glow"
        style={{ left: "50%", animationDuration: "5s" }}
      >
        <div
          className="lantern-thread"
          style={{ height: "30px" }}   // 👈 medium
        ></div>
        <div className="text-yellow-300 text-3xl text-center">🏮</div>
      </div>

      <div
        className="lantern-wrapper lantern-glow"
        style={{ left: "70%", animationDuration: "5s" }}
      >
        <div
          className="lantern-thread"
          style={{ height: "50px" }}   // 👈 medium
        ></div>
        <div className="text-yellow-300 text-3xl text-center">🏮</div>
      </div>

      <div
        className="lantern-wrapper lantern-glow"
        style={{ left: "85%", animationDuration: "5s" }}
      >
        <div
          className="lantern-thread"
          style={{ height: "60px" }}   // 👈 medium
        ></div>
        <div className="text-yellow-300 text-3xl text-center">🏮</div>
      </div>

      {/* RIGHT — Medium */}
      <div
        className="lantern-wrapper lantern-glow"
        style={{ left: "85%", animationDuration: "5s" }}
      >
        <div
          className="lantern-thread"
          style={{ height: "60px" }}   // 👈 medium
        ></div>
        <div className="text-yellow-300 text-3xl text-center">🏮</div>
      </div>

      {/* Text */}
      <div className="relative text-center mt-10 z-10">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide text-glow">
          🌙 Jashn-E-Ramadan
        </h1>

        <p className="text-base sm:text-lg font-semibold mt-2">
          🕌 Break your fast with{" "}
          <span className="text-yellow-300 font-extrabold text-glow">
            GullyFoods
          </span>
        </p>

        <p className="text-xs opacity-90 mt-1">
          ✨ Delicious Iftar & Sehri meals delivered fresh ✨
        </p>
      </div>
    </section>
  );
};

export default EventBanner;
