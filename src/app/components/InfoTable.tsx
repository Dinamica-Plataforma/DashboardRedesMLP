'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { MapInteractionContext } from '../context/MapInteractionContext';

interface NodeInfo {
  nombre: string;
  conexionesEntrantes: number;
  conexionesSalientes: number;
  cb: string;
  evu: string;
  lp: string;
  descripcion?: string;
  cb_description?: string;
  evu_description?: string;
  lp_description?: string;
}

interface InfoTableProps {
  data: NodeInfo | null;
  isVisible: boolean;
  onClose: () => void;
  skipAnimation?: boolean;
  onFilter?: (topicName: string) => void;
  onWidthChange?: (width: number) => void;
}

const InfoTable: React.FC<InfoTableProps> = ({ data, isVisible, onClose, skipAnimation = false, onFilter, onWidthChange }) => {
  const { } = useContext(MapInteractionContext);
  const [activeTab, setActiveTab] = useState<'general' | 'actores'>('general');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [width, setWidth] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  const [activeDescription, setActiveDescription] = useState<'cb' | 'evu' | 'lp'>('cb');
  const resizeRef = useRef<HTMLDivElement>(null);
  const DEFAULT_WIDTH = 500;
  const MAX_WIDTH = 800;

  const toggleWidth = () => {
    const newWidth = width === MAX_WIDTH ? DEFAULT_WIDTH : MAX_WIDTH;
    setWidth(newWidth);
    if (onWidthChange) {
      onWidthChange(newWidth);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= DEFAULT_WIDTH && newWidth <= MAX_WIDTH) {
        setWidth(newWidth);
        if (onWidthChange) {
          onWidthChange(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onWidthChange]);

  useEffect(() => {
    if (isVisible && onWidthChange) {
      onWidthChange(width);
    }
  }, [isVisible, width, onWidthChange]);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      if (!skipAnimation) {
        // Forzar un reflow para asegurar que la animación funcione
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _ = document.body.offsetHeight;
        setIsAnimating(true);
      } else {
        setIsAnimating(true);
      }
    } else {
      if (!skipAnimation) {
        setIsAnimating(false);
        const timer = setTimeout(() => {
          setShouldRender(false);
        }, 300);
        return () => clearTimeout(timer);
      } else {
        setShouldRender(false);
      }
    }
  }, [isVisible, skipAnimation]);

  if (!shouldRender) return null;

  // Función para obtener la descripción activa
  const getActiveDescription = () => {
    if (!data) return null;
    
    switch (activeDescription) {
      case 'cb':
        return {
          title: 'Caso Base',
          value: data.cb,
          description: data.cb_description
        };
      case 'evu':
        return {
          title: 'EVU',
          value: data.evu,
          description: data.evu_description
        };
      case 'lp':
        return {
          title: 'Largo Plazo',
          value: data.lp,
          description: data.lp_description
        };
      default:
        return null;
    }
  };

  const activeDescriptionData = getActiveDescription();

  return (
    <>
      <div 
        className={`absolute inset-y-0 left-0 bg-white/95 backdrop-blur-sm shadow-xl border-r border-gray-200 flex flex-col
          ${!skipAnimation ? 'transition-all duration-300 ease-out' : ''}
          ${isAnimating 
            ? 'translate-x-0 opacity-100' 
            : '-translate-x-full opacity-0'}`}
        style={{
          width: `${width}px`,
          minWidth: `${DEFAULT_WIDTH}px`,
          maxWidth: `${MAX_WIDTH}px`,
          willChange: 'transform, opacity',
          transform: isAnimating ? 'translateX(0)' : 'translateX(-100%)',
          opacity: isAnimating ? 1 : 0,
          zIndex: 48,
          pointerEvents: 'auto',
          height: '100%'
        }}
      >
        {/* Encabezado con título y botón cerrar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-6 pb-4 border-b border-gray-200 flex justify-between items-start h-[80px]">
          <h2 className="text-[20px] font-[700] text-[#00718b] whitespace-normal break-words pr-8">
            {data?.nombre || "Sin nombre"}
          </h2>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 ml-2 rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-[#00718b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido principal con scroll */}
        <div className="flex-1 overflow-hidden flex flex-col px-6 py-3" style={{ height: 'calc(100% - 80px - 72px)' }}>
          {/* Botones de categoría */}
          <div className="flex w-full mb-4 h-[40px]">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 px-3 py-1.5 rounded-l-lg text-[14px] font-[600] transition-all duration-200
                ${activeTab === 'general'
                  ? 'bg-[#00718b] text-white shadow-md'
                  : 'bg-gray-100 text-[#00718b] hover:bg-[#00718b]/10'
                }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('actores')}
              className={`flex-1 px-3 py-1.5 rounded-r-lg text-[14px] font-[600] transition-all duration-200
                ${activeTab === 'actores'
                  ? 'bg-[#00718b] text-white shadow-md'
                  : 'bg-gray-100 text-[#00718b] hover:bg-[#00718b]/10'
                }`}
            >
              Actores
            </button>
          </div>

          {/* Contenido de la pestaña activa */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'general' ? (
              <>
                {/* Descripción general - Ocupa el espacio flexible disponible */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4 shadow-sm transition-shadow duration-200 flex flex-col mb-4 min-h-[80px] overflow-hidden">
                  <div className="text-[14px] font-[600] text-[#00718b] mb-2 text-left">Descripción</div>
                  <div className="overflow-y-auto flex-1 scrollbar-custom">
                    <div className="pr-4">
                      {data?.descripcion ? (
                        <p className="text-[13px] text-[#575756] whitespace-pre-wrap text-left"
                           style={{ 
                             WebkitHyphens: 'none',
                             msHyphens: 'none',
                             hyphens: 'none'
                           }}
                        >{data.descripcion}</p>
                      ) : (
                        <p className="text-[13px] text-gray-500 italic">Sin descripción disponible.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sección inferior con tamaño automático */}
                <div className="flex-shrink-0">
                  {/* Conexiones en una fila - Altura automática */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 shadow-sm transition-shadow duration-200 text-center">
                      <div className="text-[15px] font-[600] text-[#00718b] mb-1">Conexiones Entrantes</div>
                      <div className="text-[20px] font-[600] text-[#575756]">{data?.conexionesEntrantes || 0}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 shadow-sm transition-shadow duration-200 text-center">
                      <div className="text-[15px] font-[600] text-[#00718b] mb-1">Conexiones Salientes</div>
                      <div className="text-[20px] font-[600] text-[#575756]">{data?.conexionesSalientes || 0}</div>
                    </div>
                  </div>

                  {/* Selector y descripción con divs de altura fija */}
                  <div className="flex">
                    {/* Columna izquierda - Selectores */}
                    <div className="w-1/3 pr-2">
                      <div className="flex flex-col gap-2">
                        <div 
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200
                            ${activeDescription === 'cb' 
                              ? 'bg-[#00718b] text-white font-medium' 
                              : 'bg-gray-50 hover:bg-gray-100'}`}
                          onClick={() => setActiveDescription('cb')}
                        >
                          <div className={`text-[14px] font-[600] ${activeDescription === 'cb' ? 'text-white' : 'text-[#00718b]'}`}>
                            Caso Base
                          </div>
                          <div className={`text-[15px] mt-1 ${
                            activeDescription === 'cb' ? 'text-white' :
                            data?.cb?.toLowerCase().trim() === 'bajo' ? 'font-[400] text-[#575756]' :
                            data?.cb?.toLowerCase().trim() === 'medio' ? 'font-[600] text-[#575756]' :
                            data?.cb?.toLowerCase().trim() === 'alto' ? 'font-[800] text-[#575756]' :
                            'font-medium text-[#575756]'
                          }`}>
                            {data?.cb || "N/A"}
                          </div>
                        </div>
                        
                        <div 
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200
                            ${activeDescription === 'evu' 
                              ? 'bg-[#00718b] text-white font-medium' 
                              : 'bg-gray-50 hover:bg-gray-100'}`}
                          onClick={() => setActiveDescription('evu')}
                        >
                          <div className={`text-[14px] font-[600] ${activeDescription === 'evu' ? 'text-white' : 'text-[#00718b]'}`}>
                            EVU
                          </div>
                          <div className={`text-[15px] mt-1 ${
                            activeDescription === 'evu' ? 'text-white' :
                            data?.evu?.toLowerCase().trim() === 'bajo' ? 'font-[400] text-[#575756]' :
                            data?.evu?.toLowerCase().trim() === 'medio' ? 'font-[600] text-[#575756]' :
                            data?.evu?.toLowerCase().trim() === 'alto' ? 'font-[800] text-[#575756]' :
                            'font-medium text-[#575756]'
                          }`}>
                            {data?.evu || "N/A"}
                          </div>
                        </div>
                        
                        <div 
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200
                            ${activeDescription === 'lp' 
                              ? 'bg-[#00718b] text-white font-medium' 
                              : 'bg-gray-50 hover:bg-gray-100'}`}
                          onClick={() => setActiveDescription('lp')}
                        >
                          <div className={`text-[14px] font-[600] ${activeDescription === 'lp' ? 'text-white' : 'text-[#00718b]'}`}>
                            Largo Plazo
                          </div>
                          <div className={`text-[15px] mt-1 ${
                            activeDescription === 'lp' ? 'text-white' :
                            data?.lp?.toLowerCase().trim() === 'bajo' ? 'font-[400] text-[#575756]' :
                            data?.lp?.toLowerCase().trim() === 'medio' ? 'font-[600] text-[#575756]' :
                            data?.lp?.toLowerCase().trim() === 'alto' ? 'font-[800] text-[#575756]' :
                            'font-medium text-[#575756]'
                          }`}>
                            {data?.lp || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Línea divisoria */}
                    <div className="border-r border-gray-200 mx-1 h-auto"></div>
                    
                    {/* Columna derecha - Descripción */}
                    <div className="w-2/3 pl-2">
                      <div className="bg-gray-50 p-4 rounded-lg h-[230px] flex flex-col">
                        <div className="text-[14px] font-[700] text-[#00718b] mb-2 flex-shrink-0">
                          {activeDescriptionData?.title || "Sin datos"}
                        </div>
                        <div className="overflow-y-auto flex-1 scrollbar-custom">
                          <div className="pr-4">
                            {activeDescriptionData?.description ? (
                              <p className="text-[13px] text-[#575756] text-left leading-relaxed"
                                style={{ 
                                  WebkitHyphens: 'none',
                                  msHyphens: 'none',
                                  hyphens: 'none',
                                  wordSpacing: 'normal'
                                }}>
                                {activeDescriptionData.description}
                              </p>
                            ) : (
                              <p className="text-[13px] text-gray-500 italic">Sin información para {activeDescriptionData?.title || "este elemento"}.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Contenido de la pestaña "Actores"
              <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500 py-8">
                  Información de actores no disponible aún
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón al final */}
        <div className="p-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm h-[72px]">
          <button
            onClick={() => {
              if (data?.nombre && onFilter) {
                onFilter(data.nombre);
              }
            }}
            className="w-full bg-[#00718b] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#00718b]/90 transition-colors duration-200 flex items-center justify-center space-x-2"
            disabled={!data?.nombre}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-[13px]">Zoom conexiones {data?.nombre ? (data.nombre.length > 30 ? data.nombre.substring(0, 30) + "..." : data.nombre) : ""}</span>
          </button>
        </div>
      </div>
      
      {/* Botón de expansión y borde de redimensionamiento */}
      <div 
        className={`absolute inset-y-0 ${isAnimating ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={{ left: `${width}px` }}
      >
        {/* Botón de expansión */}
        <div
          className="absolute top-24 -right-6 bg-white/95 backdrop-blur-sm border-r border-t border-b border-gray-200 rounded-r-lg py-3 px-1 cursor-pointer hover:bg-gray-50 transition-colors z-10 group"
          style={{
            marginLeft: '-1px', // Para alinear perfectamente con el borde del InfoTable
            boxShadow: '2px 1px 3px rgba(0, 0, 0, 0.1)' // Sombra solo en el lado derecho
          }}
          onClick={toggleWidth}
          title={width === MAX_WIDTH ? "Reducir panel" : "Expandir panel"}
        >
          <svg 
            className={`w-4 h-4 transition-transform duration-200 text-[#00718b] group-hover:text-[#00718b]/80 ${width === MAX_WIDTH ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Borde de redimensionamiento */}
        <div
          ref={resizeRef}
          className={`absolute inset-y-0 cursor-ew-resize select-none w-1 bg-transparent hover:bg-[#00718b]/20 active:bg-[#00718b]/40 transition-colors
            ${isResizing ? 'bg-[#00718b]/40' : ''}`}
          style={{ cursor: 'ew-resize' }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        />
      </div>
    </>
  );
};

export default InfoTable;

/* Estilos globales para la scrollbar */
<style jsx global>{`
  .scrollbar-custom::-webkit-scrollbar {
    width: 8px;
  }
  
  .scrollbar-custom::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .scrollbar-custom::-webkit-scrollbar-thumb {
    background: #00718b;
    border-radius: 4px;
  }
  
  .scrollbar-custom::-webkit-scrollbar-thumb:hover {
    background: #005f75;
  }
  
  .scrollbar-custom {
    scrollbar-width: thin;
    scrollbar-color: #00718b #f1f1f1;
  }
`}</style>
