"use client";

import { useState, useEffect, createContext } from "react";
import Header from "./components/Header";
import NetwordMap from "./components/NetwordMap";
import PoweredBy from "./components/SignBottomRight"; // Importa el componente de la firma
import Presentation from "./components/Presentation";

// Contexto para controlar la interacción global con el mapa
export const MapInteractionContext = createContext({
  isMapInteractionBlocked: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsMapInteractionBlocked: (value: boolean) => {}
});

export default function Home() {
  const [showPresentation, setShowPresentation] = useState(true);
  const [isMapInteractionBlocked, setIsMapInteractionBlocked] = useState(true); // Inicialmente bloqueado por la presentación

  const handleClosePresentation = () => {
    setShowPresentation(false);
    // Permitir interacción con el mapa cuando se cierra la presentación
    setIsMapInteractionBlocked(false);
  };

  // Asegurar que las interacciones estén bloqueadas cuando la presentación está abierta
  useEffect(() => {
    setIsMapInteractionBlocked(showPresentation);
  }, [showPresentation]);

  return (
    <MapInteractionContext.Provider value={{ isMapInteractionBlocked, setIsMapInteractionBlocked }}>
      <main className="h-screen flex flex-col">
        <div>
          <Header title="Dashboard Redes MLP" logoSrc="/images/logo_mlp.svg"/>
        </div>
        <NetwordMap />
        
        {/* Aquí se integra el componente PoweredBy */}
        <PoweredBy logoSrc="/images/logo_dp.svg" signatureText="Powered by" />
        
        {/* Componente de presentación */}
        <Presentation 
          isOpen={showPresentation} 
          onClose={handleClosePresentation} 
        />
      </main>
    </MapInteractionContext.Provider>
  );
}
