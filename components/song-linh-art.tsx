// ============================================================
// FILE: components/song-linh-art.tsx
// ============================================================

import React from 'react';

interface SvgArtProps {
  className?: string;
}

export function LotusSeal({ className = 'w-24 h-24' }: SvgArtProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer rotating orbit ring */}
      <circle
        cx="60"
        cy="60"
        r="54"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeDasharray="6 6"
        className="animate-spin-slow origin-center"
      />
      <circle
        cx="60"
        cy="60"
        r="44"
        stroke="#C8102E"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      {/* Orbiting golden dots */}
      <g className="animate-spin-slow origin-center">
        <circle cx="60" cy="6" r="4" fill="#C8102E" />
        <circle cx="60" cy="114" r="3.5" fill="#D4AF37" />
        <circle cx="6" cy="60" r="3" fill="#2D3561" />
        <circle cx="114" cy="60" r="3" fill="#D4AF37" />
      </g>
      {/* Lotus Petals */}
      <g className="animate-lotus-bloom origin-center">
        <path
          d="M60 22C67 35 71 46 60 58C49 46 53 35 60 22Z"
          fill="#C8102E"
          fillOpacity="0.9"
          stroke="#D4AF37"
          strokeWidth="1.2"
        />
        <path
          d="M60 58C72 46 84 42 94 48C86 60 74 63 60 58Z"
          fill="#C8102E"
          fillOpacity="0.75"
          stroke="#D4AF37"
          strokeWidth="1.2"
        />
        <path
          d="M60 58C48 46 36 42 26 48C34 60 46 63 60 58Z"
          fill="#C8102E"
          fillOpacity="0.75"
          stroke="#D4AF37"
          strokeWidth="1.2"
        />
        <path
          d="M60 58C69 38 80 30 86 33C82 47 72 54 60 58Z"
          fill="#D4AF37"
          fillOpacity="0.65"
        />
        <path
          d="M60 58C51 38 40 30 34 33C38 47 48 54 60 58Z"
          fill="#D4AF37"
          fillOpacity="0.65"
        />
        {/* Lotus base */}
        <path
          d="M36 66C46 73 74 73 84 66C76 79 44 79 36 66Z"
          fill="#D4AF37"
        />
        <circle cx="60" cy="58" r="5" fill="#FAF6F0" stroke="#D4AF37" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function SilkCloudBand({ className = 'w-full h-16' }: SvgArtProps) {
  return (
    <svg
      viewBox="0 0 1200 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 55C90 20 170 80 260 48C350 16 440 82 540 45C640 8 730 78 830 46C930 14 1040 80 1130 44C1165 30 1185 40 1200 50V100H0V55Z"
        fill="url(#silkGrad1)"
        fillOpacity="0.45"
      />
      <path
        d="M0 68C110 38 220 88 330 58C440 28 550 85 670 52C790 19 890 82 1010 54C1090 35 1150 62 1200 66"
        stroke="#D4AF37"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M0 40C130 72 250 18 390 50C530 82 650 22 790 52C930 82 1060 28 1200 48"
        stroke="#C8102E"
        strokeOpacity="0.28"
        strokeWidth="1.5"
        strokeDasharray="8 6"
      />
      <defs>
        <linearGradient id="silkGrad1" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C8102E" stopOpacity="0.18" />
          <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2D3561" stopOpacity="0.18" />
        </linearGradient>
      </defs>
    </svg>
  );
}
