import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeaderSection, Section } from '@/app/components/common/HeaderSection';

interface HeaderProps {
  /** Lista de secciones del menú */
  sections: Section[];
  /** Correo del usuario */
  //email: string;
  /** Ruta al logo (Next.js static import) */
  logoSrc?: string;
}

/**
 * Componente Header fijo en la parte superior
 */
export default function Header({
  sections,
  //email,
  logoSrc = '/mlp_logo.svg',
}: HeaderProps) {
  return (
    <header className="
      sticky top-0 w-full bg-white h-[88px]
      shadow-[0_4px_4px_rgba(0,0,0,0.25)] z-[100]
    ">
      <div className="h-full flex items-center px-6">
        {/* Logo a la izquierda */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src={logoSrc}
            alt="Logo"
            width={120}
            height={40}
            priority
            className="w-auto h-auto"
          />
        </Link>

        {/* Espaciador para centrar secciones */}
        <div className="flex-grow" />

        {/* Secciones centradas */}
        <div className="flex">
          <HeaderSection sections={sections} />
        </div>

        {/* Espaciador para alinear botón a la derecha */}
        <div className="flex-grow" />

        {/* Botón de usuario */}
        {/* <Button email={email} /> */}
      </div>
    </header>
  );
}
        