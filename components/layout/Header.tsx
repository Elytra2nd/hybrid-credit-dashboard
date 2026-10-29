"use client";

import React, { useEffect, useState } from "react";
import { Landmark, ShieldCheck, Activity, Wifi, WifiOff } from "lucide-react";
import { checkApiHealth } from "@/lib/api";

export default function Header() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<string>("Memeriksa koneksi...");

  useEffect(() => {
    async function verify() {
      const res = await checkApiHealth();
      setIsOnline(res.online);
      setStatusMsg(res.message);
    }
    verify();
    const interval = setInterval(verify, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#0F2942] text-white border-b border-[#1E3E60] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Corporate Logo Section */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                HYBRID CREDIT SCORING SYSTEM
              </h1>
              <span className="bg-blue-950 text-blue-200 text-xs px-2 py-0.5 rounded border border-blue-700/50 font-medium">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-300">
              PT Bina Area Persada &bull; Bank Kalbar &bull; Sistem Pendukung Keputusan Eksekutif
            </p>
          </div>
        </div>

        {/* System & Model Status Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/60 border border-slate-700/60 px-3 py-1.5 rounded-md text-xs text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>XGBoost + Prophet + SHAP</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border ${
              isOnline
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
                : "bg-rose-950/80 text-rose-300 border-rose-700/60"
            }`}
            title={statusMsg}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>FastAPI Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Backend Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
