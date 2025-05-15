"use client";

import React, { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapInteractionContext } from '../context/MapInteractionContext';

interface PresentationProps {
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  imageSrc?: string;
  developerLogoSrc?: string;
}

const Presentation: React.FC<PresentationProps> = ({
  isOpen = true,
  onClose,
  title = "Dashboard Redes MLP",
  description = "Bienvenido al Dashboard de Redes de Minera Los Pelambres, desarrollado por Dinámica Plataforma. Esta herramienta le permite visualizar y analizar de forma interactiva las conexiones y relaciones entre los distintos temas críticos de la red.\n\nFuncionalidades principales:\n• Visualización gráfica de relaciones entre temas críticos\n• Filtrado y búsqueda de conexiones específicas por temas críticos\n• Información detallada de cada tema crítico y sus interacciones\n• Vista general del mapa de redes de temas críticos\n\nPara comenzar, explore el mapa haciendo clic en los nodos para desplegar la información, y navegue por los distintos menús que ofrece la plataforma.",
  imageSrc = "/images/demo.png",
  developerLogoSrc = "/images/logo_dp_blue.svg"
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const { setIsMapInteractionBlocked } = useContext(MapInteractionContext);
  
  // Referencia al intervalo para poder limpiarlo
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Función para bloquear los eventos de hover y tooltips de la red
  const blockNetworkInteractions = () => {
    // Buscar y ocultar los tooltips del mapa
    const tooltips = document.querySelectorAll('div[style*="z-index: 9999"]');
    tooltips.forEach(tooltip => {
      if (tooltip instanceof HTMLElement) {
        tooltip.style.display = 'none';
        tooltip.style.opacity = '0';
      }
    });
    
    // Detener la animación requestAnimationFrame de detección de hover
    const visTooltip = document.querySelector('.vis-tooltip');
    if (visTooltip instanceof HTMLElement) {
      visTooltip.style.display = 'none !important';
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Forzar un reflow para asegurar que la animación funcione
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      document.body.offsetHeight;
      setIsAnimating(true);
      
      // Prevenir scroll en el body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
      
      // Crear una capa bloqueante para evitar interacciones con elementos subyacentes
      const blocker = document.createElement('div');
      blocker.id = 'interaction-blocker';
      Object.assign(blocker.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '49',
        cursor: 'default',
        pointerEvents: 'all',
      });
      document.body.appendChild(blocker);
      
      // Actualizar el contexto global
      setIsMapInteractionBlocked(true);
      
      // Bloquear los eventos de hover del mapa
      blockNetworkInteractions();
      
      // Configurar un intervalo para seguir bloqueando los tooltips que podrían aparecer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(blockNetworkInteractions, 200);
    } else {
      setIsAnimating(false);
      
      // Restaurar scroll cuando se cierra
      document.body.style.overflow = '';
      
      // Eliminar la capa bloqueante
      const blocker = document.getElementById('interaction-blocker');
      if (blocker) {
        document.body.removeChild(blocker);
      }
      
      // Limpiar el intervalo cuando se cierra
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Desbloquear las interacciones del mapa
      setIsMapInteractionBlocked(false);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    
    // Limpiar recursos al desmontar
    return () => {
      document.body.style.overflow = '';
      const blocker = document.getElementById('interaction-blocker');
      if (blocker) {
        document.body.removeChild(blocker);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Asegurarse de desbloquear las interacciones del mapa al desmontar
      setIsMapInteractionBlocked(false);
    };
  }, [isOpen, setIsMapInteractionBlocked]);

  // Manejador para cerrar al hacer clic fuera del modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Cerramos solo si el clic fue directamente en el overlay (no en sus hijos)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center"
      onClick={handleOverlayClick}
      style={{ pointerEvents: 'all' }}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 overflow-hidden transition-all duration-300 ease-out relative ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ pointerEvents: 'all' }}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#00718b]">{title}</h2>
          
          {/* Developer logo alineado con el título */}
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Developed by</span>
            <Link href="https://www.dinamicaplataforma.com/" target="_blank" rel="noopener noreferrer">
              <Image
                src={developerLogoSrc}
                alt="Developer logo"
                width={80}
                height={30}
                priority
              />
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row max-h-[40vh] min-h-[300px]">
          {/* Contenido descriptivo a la izquierda con scroll */}
          <div className="p-6 md:w-1/2 overflow-y-auto">
            <div className="pr-2">
              {description.split('\n').map((paragraph, index) => (
                <p key={index} className="text-[#575756] text-base leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          
          {/* Imagen a la derecha */}
          <div className="p-6 md:w-1/2 flex items-center justify-center">
            <div className="relative w-full h-[300px] rounded-lg bg-white p-2">
              <div className="w-full h-full relative rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <Image
                  src={imageSrc}
                  alt="Demostración del dashboard"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-center">
          <button
            onClick={onClose}
            className="bg-[#00718b] text-white px-8 py-3 rounded-lg shadow hover:bg-[#00718b]/90 transition-colors duration-200 font-medium"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default Presentation;
