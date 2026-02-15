"use client";

import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  repeat?: number;
  children: ReactNode;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = true,
  vertical = false,
  repeat = 6,
  children,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={twMerge(
        "group relative flex overflow-hidden [--duration:30s] [--gap:1.5rem] [gap:var(--gap)]",
        vertical ? "flex-col" : "flex-row",
        className
      )}
    >
      {/* LEFT EDGE FADE */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-20 bg-gradient-to-r from-background via-background/70 to-transparent" />

      {/* RIGHT EDGE FADE */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-20 bg-gradient-to-l from-background via-background/70 to-transparent" />

      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={twMerge(
            "flex shrink-0 justify-around [gap:var(--gap)] will-change-transform",
            vertical
              ? "animate-marquee-vertical flex-col"
              : "animate-marquee flex-row",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
            "motion-reduce:animate-none"
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
