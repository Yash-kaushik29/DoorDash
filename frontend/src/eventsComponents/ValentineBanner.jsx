import React from "react";
import '../index.css'
import ValentineCarousel from "./ValentineCarousel";

const valentineProducts = [
  {
    id: 1,
    name: "Valentine Chocolates 🍫",
    price: 99,
    image: "https://tse3.mm.bing.net/th/id/OIP.3y-wUgs7fDVANmMTIV3HNgHaHa?pid=Api&P=0&h=180",
  },
  {
    id: 2,
    name: "Red Rose 🌹",
    price: 49,
    image: "https://tse4.mm.bing.net/th/id/OIP.1_bn9xYTxijXbkM7EZbY3QHaKI?pid=Api&P=0&h=180",
  },
  {
    id: 3,
    name: "Chocolate Combo 💝",
    price: 129,
    image: "https://tse1.mm.bing.net/th/id/OIP.n44XC1YMG00yqtXyWcqnnwHaHa?pid=Api&P=0&h=180",
    featured: true,
  },
  {
    id: 4,
    name: "Rose + Chocolate 💘",
    price: 149,
    image: "https://tse2.mm.bing.net/th/id/OIP.CbeqTSklZ_xY6Jt91GQx3gHaHa?pid=Api&P=0&h=180",
    featured: true,
  },
];

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

      {/* Product Carousel */}
      <ValentineCarousel  valentineProducts={valentineProducts} />
    </section>
  );
};

export default ValentineBanner;
