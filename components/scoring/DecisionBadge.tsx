"use client";

import React from "react";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DecisionBadgeProps {
  rekomendasi: string;
  kategori: string;
  score: number;
}

export default function DecisionBadge({ rekomendasi, kategori, score }: DecisionBadgeProps) {
  const isApproved = score >= 700;
  const isReview   = score >= 580 && score < 700;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border",
        isApproved
          ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
          : isReview
          ? "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20"
          : "bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20"
      )}
    >
      {isApproved ? (
        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
      ) : isReview ? (
        <AlertCircle className="size-4 shrink-0 text-amber-500" />
      ) : (
        <XCircle className="size-4 shrink-0 text-rose-500" />
      )}
      <span className="truncate">
        {rekomendasi} · {kategori}
      </span>
    </div>
  );
}
