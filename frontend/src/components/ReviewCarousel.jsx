import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import api from "../utils/axiosInstance";

export default function ReviewCarousel() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get("/api/home/reviews/latest");
        if (res.data.success) setReviews(res.data.reviews);
      } catch (error) {
        console.error("Review fetch failed:", error);
      }
    };
    fetchReviews();
  }, []);

  if (!reviews.length) return null;

  return (
    <div className="py-3 mx-4">
      <h2 className="text-center mb-3">What Our Happy Customers Say 💖</h2>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={10}
        slidesPerView={1}
        loop
        speed={3500}
        autoplay={{ delay: 0, disableOnInteraction: false }}
        breakpoints={{
          480: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
        }}
      >
        {reviews.map((r, i) => (
          <SwiperSlide key={i}>
            <ReviewCard review={r} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function ReviewCard({ review }) {
  const avgRating = (
    (review.appRatings + review.deliveryRatings + review.overallRatings) /
    3
  ).toFixed(1);

  return (
    <div
      className="min-h-[90px] rounded-md border border-gray-200 dark:border-gray-800 
              bg-white dark:bg-gray-800 p-3 shadow-sm flex flex-col justify-between"
    >
      <div className="flex flex-col-reverse gap-y-2 justify-center text-xs">
        <div className="flex items-center gap-[2px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-[12px] ${
                i < Math.round(avgRating)
                  ? "text-yellow-500"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            >
              ★
            </span>
          ))}
          <span className="text-yellow-500 font-medium"> ({avgRating})</span>
        </div>

        <span className="font-semibold text-green-500 truncate">
          {review.user?.username || review.name}
        </span>
      </div>

      <p className="text-[11px] leading-[1.4] text-gray-600 dark:text-gray-200 line-clamp-2">
        {review.review}
      </p>
    </div>
  );
}
