'use client';

import React, { useState } from 'react';

interface LeyendProps {
  className?: string;
}

const Leyend: React.FC<LeyendProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`${className} bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-2.5 border border-gray-200 cursor-pointer`}
      onClick={toggleExpand}
    >
      <div className="flex justify-between items-center mb-1.5">
        <h3 className="text-[15px] font-[600] text-[#00718b]">Leyenda</h3>
        <svg 
          className={`w-4 h-4 text-[#00718b] transition-transform duration-200 ${isExpanded ? 'rotate-0' : 'rotate-180'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </div>
      
      {isExpanded && (
        <>
          {/* Conexiones */}
          <div className="mb-2.5">
            <h4 className="text-[13px] font-[500] text-[#575756] mb-1">Relevancia del vínculo</h4>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="w-8 h-0 border-t-4 border-[#575756] opacity-20 mr-2"></div>
                <span className="text-[12px] text-[#575756] font-[400]">Bajo</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-0 border-t-4 border-[#575756] opacity-60 mr-2"></div>
                <span className="text-[12px] text-[#575756] font-[600]">Medio</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-0 border-t-4 border-[#575756] opacity-100 mr-2"></div>
                <span className="text-[12px] text-[#575756] font-[800]">Alto</span>
              </div>
            </div>
          </div>
          
          {/* Nodos */}
          <div>
            <h4 className="text-[13px] font-[500] text-[#575756] mb-1">Nodos</h4>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#78c7c9] mr-2"></div>
                <span className="text-[12px] text-[#575756]">Nodo estándar</span>
              </div>
              <div className="flex items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#d51224] mr-2"></div>
                <span className="text-[12px] text-[#575756]">Nodo filtrado</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Leyend;
