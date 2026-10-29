"use client";

import React from "react";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface DecisionBadgeProps {
  rekomendasi: string;
  kategori: string;
  score: number;
}

export default function DecisionBadge({ rekomendasi, kategori, score }: DecisionBadgeProps) {
  const isApproved = score >= 700;
  const isReview = score >= 580 && score < 700;

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
        isApproved
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm"
          : isReview
          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40"
          : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 shadow-sm"
      }`}
    >
      {isApproved ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      ) : isReview ? (
        <AlertCircle className="w-4 h-4 text-amber-400" />
      ) : (
        <XCircle className="w-4 h-4 text-rose-400" />
      )}
      <span>{rekomendasi} &bull; {kategori}</span>
    </div>
  );
}
