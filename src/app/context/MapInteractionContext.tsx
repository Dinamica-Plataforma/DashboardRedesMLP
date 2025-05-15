"use client";

import { createContext } from "react";

// Contexto para controlar la interacción global con el mapa
export const MapInteractionContext = createContext({
  isMapInteractionBlocked: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsMapInteractionBlocked: (_: boolean) => {}
}); 