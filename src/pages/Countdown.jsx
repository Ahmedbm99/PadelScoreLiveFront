import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Countdown() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const targetTime = new Date();
    targetTime.setHours(18, 0, 0, 0); // 18:00

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetTime - now;

      if (diff <= 0) {
        clearInterval(interval);
        navigate("/spectator");
        return;
      }

      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
      const minutes = String(
        Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      ).padStart(2, "0");
      const seconds = String(
        Math.floor((diff % (1000 * 60)) / 1000)
      ).padStart(2, "0");

      setTimeLeft(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center px-4">
      
      {/* Logo */}
      <img
        src="/Black png.png"
        alt="Padel Du Coeur Logo"
        className="h-52 w-52 drop-shadow-lg"
      />

      {/* Title */}
      <h1 className="text-5xl font-extrabold tracking-tight mb-2">
        Padel Du Coeur
      </h1>

<div className="mt-8 bg-red-400 px-6 py-3 rounded-lg shadow-lg">
  <h2
    className="text-white text-3xl font-bold"
    style={{ fontFamily: "Arial, sans-serif" }}
  >
    Smash For a Cause
  </h2>
</div>

      {/* Countdown */}
      <div className="text-6xl font-mono mt-10 bg-black/30 px-8 py-4 rounded-xl shadow-lg">
        {timeLeft}
      </div>
      
           {/* Slogan */}

    </div>
  );
}
