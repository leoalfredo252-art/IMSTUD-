/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
}

export default function Logo({ variant = 'horizontal', size = 'md', showSlogan = false }: LogoProps) {
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
    // Colors
    const primaryColor = isMonochrome ? 'currentColor' : '#1e3a8a'; // Deep Blue (Azul Escuro)
    const secondaryColor = isMonochrome ? 'currentColor' : '#d97706'; // Gold (Dourado)
    const bookColor = isMonochrome ? 'currentColor' : '#2563eb'; // Support blue
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
        {/* Background rounded container for APP ICON style */}
        {variant === 'icon' && (
          <rect width="120" height="120" rx="28" fill={primaryColor} />
        )}

        {/* 1. OPEN BOOK INTEGRATED - base of learning and the lettrs */}
        <path
          d="M25 82C38 78 50 82 60 88C70 82 82 78 95 82V42C82 38 70 42 60 48C50 42 38 38 25 42V82Z"
          fill={variant === 'icon' ? '#1d4ed8' : '#f8fafc'}
          stroke={variant === 'icon' ? secondaryColor : primaryColor}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        
        {/* Pages Lines inside the Book */}
        <path
          d="M32 50C40 48 48 50 54 53"
          stroke={variant === 'icon' ? '#93c5fd' : '#94a3b8'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M32 60C40 58 48 60 54 63"
          stroke={variant === 'icon' ? '#93c5fd' : '#94a3b8'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M32 70C40 68 48 70 54 73"
          stroke={variant === 'icon' ? '#93c5fd' : '#94a3b8'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        <path
          d="M88 50C80 48 72 50 66 53"
          stroke={variant === 'icon' ? '#93c5fd' : '#94a3b8'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M88 60C80 58 72 60 66 63"
          stroke={variant === 'icon' ? '#93c5fd' : '#94a3b8'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M88 70C80 68 72 70 66 73"
          stroke={variant === 'icon' ? '#93c5fd' : '#94a3b8'}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* 2. THE MAIN "IM" LETTERS - integrated in foreground */}
        {/* Letter I */}
        <path
          d="M42 42V78"
          stroke={variant === 'icon' ? whiteColor : primaryColor}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M37 42H47M37 78H47"
          stroke={variant === 'icon' ? whiteColor : primaryColor}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Letter M */}
        <path
          d="M58 78V42L72 60L86 42V78"
          stroke={variant === 'icon' ? whiteColor : primaryColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. SUBTLE GRADUATION CAP - sitting elegantly atop the letter "I" as a diamond/hat */}
        {/* Cap diamond */}
        <path
          d="M42 22L54 27L42 32L30 27L42 22Z"
          fill={secondaryColor}
          stroke={variant === 'icon' ? whiteColor : primaryColor}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Cap tassel */}
        <path
          d="M54 27V34C54 36 52 38 52 38"
          stroke={secondaryColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Golden Central Ribbon / Book Separator */}
        <path
          d="M60 48V92"
          stroke={secondaryColor}
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Spark of growth / innovation */}
        <path
          d="M60 88L60 98"
          stroke={secondaryColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  const isMonochrome = variant === 'monochrome';
  const textColorClass = isMonochrome ? 'text-current' : 'text-slate-900';
  const brandBlueClass = isMonochrome ? 'text-current' : 'text-blue-900';
  const brandGoldClass = isMonochrome ? 'text-current' : 'text-amber-600';

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
          <h1 className={`${currentSize.text} font-bold tracking-wider ${textColorClass}`}>
            <span className={brandBlueClass}>IM</span>
            <span className={brandGoldClass}>STUD</span>
          </h1>
          {showSlogan && (
            <p className={`${currentSize.slogan} mt-0.5 uppercase tracking-widest font-semibold text-slate-500`}>
              Innovation Through Learning
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
          <span className={brandBlueClass}>IM</span>
          <span className={brandGoldClass}>STUD</span>
        </h1>
        {showSlogan && (
          <p className={`${currentSize.slogan} mt-1 uppercase tracking-widest font-bold text-slate-500`}>
            Innovation Through Learning
          </p>
        )}
      </div>
    </div>
  );
}
