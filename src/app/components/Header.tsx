import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  signatureText: string;
  signatureLogoSrc?: string;
  logoSrc?: string;
}

export default function Header({
  title,
  signatureText,
  signatureLogoSrc = '/developer_logo.svg',
  logoSrc = '/mlp_logo.svg',
}: HeaderProps) {
  return (
    <header className="top-0 w-full bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto h-[88px] flex items-center px-6">
        <div className="flex-shrink-0">
          <Link href="https://web.pelambres.cl/">
            <Image
              src={logoSrc}
              alt="Logo principal"
              width={120}
              height={40}
              priority
              className="w-auto h-auto"
            />
          </Link>
        </div>

        <div className="h-10 w-px bg-gray-300 mx-4" />

        <div className="flex-grow text-center">
          <h1 className=" md:text-3xl font-sans font-light  tracking-tight text-[#186170]">
          {title}
          </h1>
        </div>

        <div className="h-10 w-px bg-gray-300 mx-4" />

        <div className="flex-shrink-0 flex items-center w-[120px] justify-end space-x-1">
          <Link href="https://www.dinamicaplataforma.com/" target="_blank">
          <span className="text-sm italic text-[#4f666a]">
            {signatureText}
          </span>
          <Image
            src={signatureLogoSrc}
            alt="Logo firma"
            width={16}
            height={16}
            className="inline-block h-4 w-auto align-text-bottom"
          />
          </Link>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-[#186170] to-[#bf6218] opacity-50" />
    </header>
  );
}
