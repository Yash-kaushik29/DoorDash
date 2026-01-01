import { useEffect, useState } from "react";
import "../index.css";

const CountdownTimer = () => {
  const calculateTimeLeft = () => {
    const target = new Date("January 1, 2026 00:00:00").getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
        🎉 <span className="text-shine">HAPPY NEW YEAR 2026</span> 🎉
        <span className="block text-yellow-300 text-xl mt-2">
          New year, new cravings 😋
        </span>
      </h1>

      <div className="flex justify-center gap-3 text-white">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Min", value: timeLeft.minutes },
          { label: "Sec", value: timeLeft.seconds },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl text-center"
          >
            <div className="text-2xl font-bold">
              {String(item.value).padStart(2, "0")}
            </div>
            <div className="text-xs uppercase tracking-wide">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
