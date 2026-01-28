import { useEffect, useRef } from "react";
import "react-multi-carousel/lib/styles.css";
import Carousel from "react-multi-carousel";

const responsive = {
  mobile: {
    breakpoint: { max: 3000, min: 0 },
    items: 2,
    partialVisibilityGutter: 40, // 👈 shows next card peek
  },
};

const ValentineCarousel = ({ valentineProducts }) => {
  return (
    <div className="relative z-10 -mx-4">
      <Carousel
        responsive={responsive}
        arrows={false}
        autoPlay
        autoPlaySpeed={2500}
        infinite
        swipeable
        draggable
        pauseOnHover
        keyBoardControl
        partialVisible
        containerClass="px-4"
        itemClass="pr-4"
      >
        {valentineProducts.map((item) => (
          <div
            key={item.id}
            className={`relative rounded-2xl bg-white/95 p-2 text-gray-800 shadow-md backdrop-blur transition active:scale-95 ${
              item.featured ? "ring-2 ring-rose-400" : ""
            }`}
          >
            {item.featured && (
              <span className="absolute top-2 right-2 text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full">
                💕 Loved
              </span>
            )}

            <img
              src={item.image}
              alt={item.name}
              className="h-20 w-full rounded-xl object-cover"
            />

            <h3 className="mt-2 text-xs font-semibold leading-tight">
              {item.name}
            </h3>

            <div className="mt-2 flex items-center justify-between">
              <span className="font-bold text-rose-500 text-sm">
                ₹{item.price}
              </span>
              <button className="rounded-full bg-rose-500 px-3 py-1 text-[11px] text-white">
                Add ❤️
              </button>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ValentineCarousel;

