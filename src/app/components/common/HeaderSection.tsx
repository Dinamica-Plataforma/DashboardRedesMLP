"use client";

// HeaderSection.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface Section {
  label: string;
  href: string;
}

interface HeaderSectionProps {
  /** Lista de secciones con etiqueta y ruta */
  sections: Section[];
}

/**
 * Componente de navegación de secciones centradas
 */
export function HeaderSection({ sections }: HeaderSectionProps) {
  const pathname = usePathname();

  return (
    <nav className="flex h-[88px]">
      {sections.map(({ label, href }) => {
        const isActive = pathname === href;
        return (
          <Link 
            key={href} 
            href={href}
            className={`relative h-full flex items-center group px-4 ${
              isActive ? 'text-[#186170]' : 'text-black'
            }`}
          >
            {label}
            <div className="absolute inset-0 bg-gradient-to-b from-[#09262b]/0 via-[#09262b]/5 to-[#09262b]/7 opacity-0 group-hover:opacity-90 transition-opacity duration-200" />
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#186170]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
