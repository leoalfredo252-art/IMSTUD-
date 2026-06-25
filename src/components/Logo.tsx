/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  theme?: 'dark' | 'light' | 'auto';
}

export default function Logo({ variant = 'horizontal', size = 'md', showSlogan = false, theme = 'auto' }: LogoProps) {
  // Size dimensions
  const dimensions = {
    sm: { icon: 32, text: 'text-lg', slogan: 'text-[9px]' },
    md: { icon: 48, text: 'text-2xl', slogan: 'text-[11px]' },
    lg: { icon: 72, text: 'text-4xl', slogan: 'text-[14px]' },
    xl: { icon: 110, text: 'text-6xl', slogan: 'text-[18px]' }
  };

  const currentSize = dimensions[size];

  // SVG Logo Icon
  const LogoIcon = ({ isMonochrome = false }) => {
    // Colors and Gradients
    const primaryColor = isMonochrome ? 'currentColor' : '#0f172a'; // Deep Slate/Blue
    const whiteColor = '#ffffff';

    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-300"
      >
        <defs>
          {/* Official Premium Gold Gradient */}
          <linearGradient id="imstudGold" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b8832e" />
            <stop offset="30%" stopColor="#dfac42" />
            <stop offset="70%" stopColor="#fbecaa" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          
          {/* Subtle drop shadow for depth */}
          <filter id="logoShadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" floodColor="#000000" />
          </filter>
        </defs>

        {/* Background rounded container for APP ICON style */}
        {variant === 'icon' && (
          <rect width="120" height="120" rx="28" fill={primaryColor} />
        )}

        <g filter="url(#logoShadow)">
          {/* 1. GRADUATION CAP (CHAPÉU ACADÉMICO) */}
          {/* Curved Mortarboard Diamond Cap */}
          <path
            d="M60 14 C73 19 87 23 95 28 C87 33 73 37 60 42 C47 37 33 33 25 28 C33 23 47 19 60 14 Z"
            fill="url(#imstudGold)"
          />
          {/* Cap Under-ring/Base */}
          <path
            d="M42 34.5 V40 C42 46 78 46 78 40 V34.5"
            stroke="url(#imstudGold)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Cap Tassel (Pendente da Borla de Alta Definição) */}
          {/* Tassel Cord */}
          <path
            d="M27 28.5 L27 41"
            stroke="url(#imstudGold)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Tassel Bead/Knot */}
          <circle cx="27" cy="42" r="2" fill="url(#imstudGold)" />
          {/* Tassel Fringe/Body */}
          <path
            d="M25.5 43.5 L24 51.5 C24 53 30 53 30 51.5 L28.5 43.5 Z"
            fill="url(#imstudGold)"
          />

          {/* 2. THE MONOGRAM LETTERS 'i' AND 'M' (UNIFIED BRAND SYMBOL) */}
          {/* Letter 'i' (Stem / Student Body) */}
          <path
            d="M42 54 V82"
            stroke="url(#imstudGold)"
            strokeWidth="8.5"
            strokeLinecap="butt"
          />
          {/* Letter 'i' Dot */}
          <circle cx="42" cy="43" r="5.5" fill="url(#imstudGold)" />

          {/* Letter 'M' (Unified & sharp, branching directly from 'i' stem) */}
          <path
            d="M45 68 L63 54 L74.5 70 L86 54 V82"
            stroke="url(#imstudGold)"
            strokeWidth="8.5"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />

          {/* 3. OPEN BOOK BASE (LIVRO ABERTO) */}
          {/* Top thick page arcs (White/silver in dark theme, Slate in light theme) */}
          <path
            d="M20 89 C38 82 50 88 60 92 C70 88 82 82 100 89"
            stroke={isMonochrome ? 'currentColor' : (theme === 'light' ? '#475569' : '#ffffff')}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Bottom parallel page arcs and binding */}
          <path
            d="M20 95 C38 88 50 94 60 98 C70 94 82 88 100 95"
            stroke="url(#imstudGold)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Book center spine point */}
          <path
            d="M60 92 V98"
            stroke="url(#imstudGold)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    );
  };

  const isMonochrome = variant === 'monochrome';
  
  // Decide text colors based on the theme prop
  let textColorClass = 'text-slate-900 dark:text-white';
  let brandTextClass = 'text-slate-900 dark:text-white';
  
  if (isMonochrome) {
    textColorClass = 'text-current';
    brandTextClass = 'text-current';
  } else if (theme === 'dark') {
    textColorClass = 'text-white';
    brandTextClass = 'text-white';
  } else if (theme === 'light') {
    textColorClass = 'text-slate-900';
    brandTextClass = 'text-slate-900';
  }

  // Premium Gold Gradient for "IM" and solid Gold for Slogan
  const brandGoldClass = isMonochrome 
    ? 'text-current' 
    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-clip-text text-transparent inline-block';

  const sloganColorClass = isMonochrome
    ? 'text-slate-500'
    : 'text-amber-500/90 font-bold';

  if (variant === 'icon') {
    return (
      <div style={{ width: currentSize.icon, height: currentSize.icon }} className="flex-shrink-0">
        <LogoIcon isMonochrome={isMonochrome} />
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className="flex flex-col items-center text-center">
        <div style={{ width: currentSize.icon, height: currentSize.icon }} className="mb-2">
          <LogoIcon isMonochrome={isMonochrome} />
        </div>
        <div className="flex flex-col items-center">
          <h1 className={`${currentSize.text} font-bold tracking-wider ${textColorClass} flex items-center justify-center`}>
            <span className={brandGoldClass}>IM</span>
            <span className={brandTextClass}>STUD</span>
          </h1>
          {showSlogan && (
            <p className={`${currentSize.slogan} mt-0.5 uppercase tracking-widest ${sloganColorClass}`}>
              Innovation Through Learning.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal
  return (
    <div className="flex items-center space-x-3">
      <div style={{ width: currentSize.icon, height: currentSize.icon }} className="flex-shrink-0">
        <LogoIcon isMonochrome={isMonochrome} />
      </div>
      <div className="flex flex-col justify-center leading-none">
        <h1 className={`${currentSize.text} font-bold tracking-wider ${textColorClass} flex items-center`}>
          <span className={brandGoldClass}>IM</span>
          <span className={brandTextClass}>STUD</span>
        </h1>
        {showSlogan && (
          <p className={`${currentSize.slogan} mt-1 uppercase tracking-widest ${sloganColorClass}`}>
            Innovation Through Learning.
          </p>
        )}
      </div>
    </div>
  );
}
