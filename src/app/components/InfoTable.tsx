'use client';

import React, { useState, useEffect } from 'react';

interface NodeInfo {
  nombre: string;
  conexionesEntrantes: number;
  conexionesSalientes: number;
  cb: string;
  evu: string;
  lp: string;
}

interface InfoTableProps {
  data: NodeInfo | null;
  isVisible: boolean;
  onClose: () => void;
  skipAnimation?: boolean;
}

const InfoTable: React.FC<InfoTableProps> = ({ data, isVisible, onClose, skipAnimation = false }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'actores'>('general');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

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
    <div 
      className={`absolute inset-y-0 left-0 w-1/4 bg-white/95 backdrop-blur-sm shadow-xl overflow-y-auto p-6 z-20 border-r border-gray-200
        ${!skipAnimation ? 'transition-all duration-300 ease-out' : ''}
        ${isAnimating 
          ? 'translate-x-0 opacity-100' 
          : '-translate-x-full opacity-0'}`}
      style={{
        willChange: 'transform, opacity',
        transform: isAnimating ? 'translateX(0)' : 'translateX(-100%)',
        opacity: isAnimating ? 1 : 0,
      }}
    >
      {/* Encabezado con título y botón cerrar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm pb-4 mb-4 border-b border-gray-200 flex justify-between items-start">
        <h2 className="text-xl font-bold text-[#186170] whitespace-normal break-words pr-8">
          {data?.nombre}
        </h2>
        <button onClick={onClose} aria-label="Cerrar" className="p-2 ml-2 rounded-full hover:bg-gray-100 transition">
          <svg className="w-5 h-5 text-[#186170]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Botones de categoría */}
      <div className="flex w-full mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 px-3 py-1.5 rounded-l-lg text-sm font-medium transition-all duration-200
            ${activeTab === 'general'
              ? 'bg-[#186170] text-white shadow-md'
              : 'bg-gray-100 text-[#186170] hover:bg-[#186170]/10'
            }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('actores')}
          className={`flex-1 px-3 py-1.5 rounded-r-lg text-sm font-medium transition-all duration-200
            ${activeTab === 'actores'
              ? 'bg-[#186170] text-white shadow-md'
              : 'bg-gray-100 text-[#186170] hover:bg-[#186170]/10'
            }`}
        >
          Actores
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      {activeTab === 'general' && data && (
        <div className="space-y-4">
          {/* Conexiones en una fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
              <div className="text-sm font-medium text-[#186170] mb-1">Conexiones Entrantes</div>
              <div className="text-sm text-gray-900">{data.conexionesEntrantes}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
              <div className="text-sm font-medium text-[#186170] mb-1">Conexiones Salientes</div>
              <div className="text-sm text-gray-900">{data.conexionesSalientes}</div>
            </div>
          </div>

          {/* Estados en una fila */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
              <div className="text-sm font-medium text-[#186170] mb-1">CB</div>
              <div className={`text-sm font-medium ${
                data.cb?.toLowerCase().trim() === 'bajo' ? 'text-green-600' :
                data.cb?.toLowerCase().trim() === 'medio' ? 'text-yellow-600' :
                data.cb?.toLowerCase().trim() === 'alto' ? 'text-red-600' :
                'text-gray-900'
              }`}>
                {data.cb}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
              <div className="text-sm font-medium text-[#186170] mb-1">EVU</div>
              <div className={`text-sm font-medium ${
                data.evu?.toLowerCase().trim() === 'bajo' ? 'text-green-600' :
                data.evu?.toLowerCase().trim() === 'medio' ? 'text-yellow-600' :
                data.evu?.toLowerCase().trim() === 'alto' ? 'text-red-600' :
                'text-gray-900'
              }`}>
                {data.evu}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
              <div className="text-sm font-medium text-[#186170] mb-1">LP</div>
              <div className={`text-sm font-medium ${
                data.lp?.toLowerCase().trim() === 'bajo' ? 'text-green-600' :
                data.lp?.toLowerCase().trim() === 'medio' ? 'text-yellow-600' :
                data.lp?.toLowerCase().trim() === 'alto' ? 'text-red-600' :
                'text-gray-900'
              }`}>
                {data.lp}
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
    </div>
  );
};

export default InfoTable;
