import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  logoSrc?: string;
}

export default function Header({
  title,
  logoSrc = '/images/logo_mlp.svg'
}: HeaderProps) {
  return (
    <header className="top-0 w-full bg-white shadow-lg z-50">
      <div className="h-[88px] flex items-center">
        <div className="flex-shrink-0">
          <Link href="https://web.pelambres.cl/">
            <Image
              src={logoSrc}
              alt="Logo principal"
              width={300}
              height={107}
              priority
              className="w-[300px] h-auto"
            />
          </Link>
        </div>

        <div className="h-10 w-px bg-[#575756] mx-4" />

        <div>
            <h1 className="md:text-5xl font-[400] tracking-tighter text-[#00718b]">
            {title}
          </h1>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-[#78c7c9] to-[#f0ae00] opacity-50" />
    </header>
  );
}
