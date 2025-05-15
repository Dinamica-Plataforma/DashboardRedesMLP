'use client';

import React, { useState, useEffect, useRef } from 'react';

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
  const [activeTab, setActiveTab] = useState<'general' | 'actores' | 'plan'>('general');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [width, setWidth] = useState(400); // Ancho inicial
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const DEFAULT_WIDTH = 400;
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
      if (newWidth >= 300 && newWidth <= 800) {
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
          minWidth: '300px',
          maxWidth: '800px',
          willChange: 'transform, opacity',
          transform: isAnimating ? 'translateX(0)' : 'translateX(-100%)',
          opacity: isAnimating ? 1 : 0,
        }}
      >
        {/* Encabezado con título y botón cerrar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-6 pb-4 border-b border-gray-200 flex justify-between items-start">
          <h2 className="text-[20px] font-[700] text-[#00718b] whitespace-normal break-words pr-8">
            {data?.nombre}
          </h2>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 ml-2 rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-[#00718b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido principal con scroll */}
        <div className="flex-1 overflow-hidden flex flex-col px-6">
          {/* Botones de categoría */}
          <div className="flex w-full my-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 px-3 py-1.5 rounded-l-lg text-[16px] font-[600] transition-all duration-200
                ${activeTab === 'general'
                  ? 'bg-[#00718b] text-white shadow-md'
                  : 'bg-gray-100 text-[#00718b] hover:bg-[#00718b]/10'
                }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('actores')}
              className={`flex-1 px-3 py-1.5 text-[16px] font-[600] transition-all duration-200
                ${activeTab === 'actores'
                  ? 'bg-[#00718b] text-white shadow-md'
                  : 'bg-gray-100 text-[#00718b] hover:bg-[#00718b]/10'
                }`}
            >
              Actores
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`flex-1 px-3 py-1.5 rounded-r-lg text-[16px] font-[600] transition-all duration-200
                ${activeTab === 'plan'
                  ? 'bg-[#00718b] text-white shadow-md'
                  : 'bg-gray-100 text-[#00718b] hover:bg-[#00718b]/10'
                }`}
            >
              Plan de acción
            </button>
          </div>

          {/* Contenido de la pestaña activa */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === 'general' && data && (
              <div className="h-full flex flex-col gap-3 overflow-hidden">
                {/* Descripción con scroll propio */}
                {data.descripcion && (
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                    <div className="text-[15px] font-[600] text-[#00718b] mb-2 text-left">Descripción</div>
                    <div className="overflow-y-auto max-h-[150px] scrollbar-custom">
                      <div className="pr-4">
                        <p className="text-[13px] text-[#575756] whitespace-pre-wrap text-justify hyphens-auto"
                           style={{ 
                             WebkitHyphens: 'auto',
                             msHyphens: 'auto',
                             hyphens: 'auto',
                             textJustify: 'inter-word'
                           }}
                        >{data.descripcion}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conexiones en una fila */}
                <div className="grid grid-cols-2 gap-3 flex-none">
                  <div className="bg-gray-50 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
                    <div className="text-[16px] font-[600] text-[#00718b] mb-1">Conexiones Entrantes</div>
                    <div className="text-[20px] font-[600] text-[#575756]">{data.conexionesEntrantes}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
                    <div className="text-[16px] font-[600] text-[#00718b] mb-1">Conexiones Salientes</div>
                    <div className="text-[20px] font-[600] text-[#575756]">{data.conexionesSalientes}</div>
                  </div>
                </div>

                {/* Estados con scroll individual */}
                <div className="flex-1 min-h-0 overflow-y-auto scrollbar-custom pr-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex min-h-[80px]">
                        <div className="w-[100px] min-w-[100px] flex flex-col items-center justify-center border-r border-gray-200 pr-4">
                          <div className="text-[16px] font-[600] text-[#00718b]">Caso Base</div>
                          <div className={`text-[20px] mt-1 ${
                            data.cb?.toLowerCase().trim() === 'bajo' ? 'font-[400]' :
                            data.cb?.toLowerCase().trim() === 'medio' ? 'font-[600]' :
                            data.cb?.toLowerCase().trim() === 'alto' ? 'font-[800]' :
                            'font-medium'
                          } text-[#575756]`}>
                            {data.cb}
                          </div>
                        </div>
                        <div className="flex-1 pl-4 overflow-y-auto scrollbar-custom">
                          <div className="pr-4">
                            {data.cb_description ? (
                              <p className="text-[12px] text-[#575756] text-justify leading-relaxed"
                                 style={{ 
                                   WebkitHyphens: 'auto',
                                   msHyphens: 'auto',
                                   hyphens: 'auto',
                                   wordSpacing: 'normal',
                                   textAlignLast: 'left'
                                 }}>
                                {data.cb_description}
                              </p>
                            ) : (
                              <p className="text-[12px] text-gray-500 italic">Sin información.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex min-h-[80px]">
                        <div className="w-[100px] min-w-[100px] flex flex-col items-center justify-center border-r border-gray-200 pr-4">
                          <div className="text-[16px] font-[600] text-[#00718b]">EVU</div>
                          <div className={`text-[20px] mt-1 ${
                            data.evu?.toLowerCase().trim() === 'bajo' ? 'font-[400]' :
                            data.evu?.toLowerCase().trim() === 'medio' ? 'font-[600]' :
                            data.evu?.toLowerCase().trim() === 'alto' ? 'font-[800]' :
                            'font-medium'
                          } text-[#575756]`}>
                            {data.evu}
                          </div>
                        </div>
                        <div className="flex-1 pl-4 overflow-y-auto scrollbar-custom">
                          <div className="pr-4">
                            {data.evu_description ? (
                              <p className="text-[12px] text-[#575756] text-justify leading-relaxed"
                                 style={{ 
                                   WebkitHyphens: 'auto',
                                   msHyphens: 'auto',
                                   hyphens: 'auto',
                                   wordSpacing: 'normal',
                                   textAlignLast: 'left'
                                 }}>
                                {data.evu_description}
                              </p>
                            ) : (
                              <p className="text-[12px] text-gray-500 italic">Sin información.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex min-h-[80px]">
                        <div className="w-[100px] min-w-[100px] flex flex-col items-center justify-center border-r border-gray-200 pr-4">
                          <div className="text-[16px] font-[600] text-[#00718b] text-center w-full">Largo Plazo</div>
                          <div className={`text-[20px] mt-1 ${
                            data.lp?.toLowerCase().trim() === 'bajo' ? 'font-[400]' :
                            data.lp?.toLowerCase().trim() === 'medio' ? 'font-[600]' :
                            data.lp?.toLowerCase().trim() === 'alto' ? 'font-[800]' :
                            'font-medium'
                          } text-[#575756]`}>
                            {data.lp}
                          </div>
                        </div>
                        <div className="flex-1 pl-4 overflow-y-auto scrollbar-custom">
                          <div className="pr-4">
                            {data.lp_description ? (
                              <p className="text-[12px] text-[#575756] text-justify leading-relaxed"
                                 style={{ 
                                   WebkitHyphens: 'auto',
                                   msHyphens: 'auto',
                                   hyphens: 'auto',
                                   wordSpacing: 'normal',
                                   textAlignLast: 'left'
                                 }}>
                                {data.lp_description}
                              </p>
                            ) : (
                              <p className="text-[12px] text-gray-500 italic">Sin información.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'actores' && (
              <div className="text-center text-gray-500 py-8">
                Información de actores no disponible aún
              </div>
            )}

            {activeTab === 'plan' && (
              <div className="text-center text-gray-500 py-8">
                Plan de acción no disponible aún
              </div>
            )}
          </div>
        </div>

        {/* Botón al final */}
        <div className="p-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
          <button
            onClick={() => {
              if (data?.nombre && onFilter) {
                onFilter(data.nombre);
              }
            }}
            className="w-full bg-[#00718b] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#00718b]/90 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-[13px]">Zoom conexiones</span>
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
