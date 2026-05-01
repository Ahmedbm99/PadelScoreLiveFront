import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Countdown() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const targetTime = new Date();
    targetTime.setHours(15, 0, 0, 0);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetTime - now;
      if (diff <= 0) {
        clearInterval(interval);
        navigate("/spectator");
        return;
      }

      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
      const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
      const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, "0");
      setTimeLeft(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-slate-950/45 p-6 shadow-2xl shadow-fuchsia-700/20 backdrop-blur-xl sm:p-8">
        <img src="/bloom.png" alt="Padel Du Coeur Logo" className="mx-auto h-28 w-28 rounded-3xl object-cover shadow-lg shadow-cyan-500/20 sm:h-32 sm:w-32" />
        <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">Bloom Cup</h1>
        <p className="mt-1 text-sm uppercase tracking-[0.2em] text-cyan-200">Smash For A Cause</p>

        <div className="mt-6 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-5 py-4 text-4xl font-bold tabular-nums text-white shadow-inner shadow-cyan-500/20 sm:text-5xl">
          {timeLeft}
        </div>
      </div>
    </div>
  );
}
