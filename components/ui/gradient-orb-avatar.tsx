import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface GradientOrbAvatarProps {
  address: string;
  size?: number;
  className?: string;
}

export function GradientOrbAvatar({
  address,
  size = 64,
  className,
}: GradientOrbAvatarProps) {
  const normalized = (address || "").trim().toLowerCase();

  const seed = useMemo(() => {
    let h = 0;
    for (let i = 0; i < normalized.length; i++) {
      h = (Math.imul(31, h) + normalized.charCodeAt(i)) | 0;
    }
    return h >>> 0;
  }, [normalized]);

  const [color1, color2] = useMemo(() => {
    const rnd = (n: number) =>
      Math.sin(seed + n) * 10000 - Math.floor(Math.sin(seed + n) * 10000);
    const h1 = Math.floor(rnd(1) * 360);
    const s1 = 50 + Math.floor(rnd(2) * 30);
    const l1 = 45 + Math.floor(rnd(3) * 20);
    const h2 = (h1 + 180 + Math.floor(rnd(4) * 60)) % 360;
    const s2 = 50 + Math.floor(rnd(5) * 30);
    const l2 = 45 + Math.floor(rnd(6) * 20);
    return [`hsl(${h1}, ${s1}%, ${l1}%)`, `hsl(${h2}, ${s2}%, ${l2}%)`];
  }, [seed]);

  const svg = useMemo(
    () => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="grad-${seed}" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </radialGradient>
    </defs>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#grad-${seed})" />
  </svg>`,
    [color1, color2, size, seed]
  );

  return (
    <div
      className={cn("block rounded-full shrink-0 overflow-hidden", className)}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Utility function to generate avatar URL as data URI
export function generateGradientAvatarUrl(address: string, size: number = 64): string {
  const normalized = (address || "").trim().toLowerCase();

  let h = 0;
  for (let i = 0; i < normalized.length; i++) {
    h = (Math.imul(31, h) + normalized.charCodeAt(i)) | 0;
  }
  const seed = h >>> 0;

  const rnd = (n: number) =>
    Math.sin(seed + n) * 10000 - Math.floor(Math.sin(seed + n) * 10000);
  const h1 = Math.floor(rnd(1) * 360);
  const s1 = 50 + Math.floor(rnd(2) * 30);
  const l1 = 45 + Math.floor(rnd(3) * 20);
  const h2 = (h1 + 180 + Math.floor(rnd(4) * 60)) % 360;
  const s2 = 50 + Math.floor(rnd(5) * 30);
  const l2 = 45 + Math.floor(rnd(6) * 20);
  const color1 = `hsl(${h1}, ${s1}%, ${l1}%)`;
  const color2 = `hsl(${h2}, ${s2}%, ${l2}%)`;

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="grad-${seed}" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </radialGradient>
    </defs>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#grad-${seed})" />
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
