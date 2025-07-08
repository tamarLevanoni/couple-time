'use client';

import { useEffect, useRef } from 'react';
import { useGamesStore } from '@/store/games-store';
import { useCentersStore } from '@/store/centers-store';

// Global flag to ensure data is only loaded once across the entire app
let globalDataLoadInitiated = false;

export function useDataInit() {
  const loadGames = useGamesStore((state) => state.loadGames);
  const loadCenters = useCentersStore((state) => state.loadCenters);
  const hasInitiated = useRef(false);

  useEffect(() => {
    if (!hasInitiated.current && !globalDataLoadInitiated) {
      hasInitiated.current = true;
      globalDataLoadInitiated = true;
      
      // Load data on app initialization
      loadGames();
      loadCenters();
    }
  }, []);

  // No need to return anything since this is only for initialization
}