'use client';

import { useEffect, useRef } from 'react';
import { useGamesStore, useCentersStore } from '@/store';

// Global flag to ensure data is only loaded once across the entire app
let globalDataLoadInitiated = false;

export function useDataInit() {
  const { loadGames, hasLoaded: gamesLoaded } = useGamesStore();
  const { loadCenters, hasLoaded: centersLoaded } = useCentersStore();
  const hasInitiated = useRef(false);

  useEffect(() => {
    if (!hasInitiated.current && !globalDataLoadInitiated) {
      hasInitiated.current = true;
      globalDataLoadInitiated = true;
      
      // Only load if not already loaded
      if (!gamesLoaded) {
        console.log('🎮 Loading games data...');
        loadGames();
      }
      if (!centersLoaded) {
        console.log('🏢 Loading centers data...');
        loadCenters();
      }
    }
  }, []); // Remove all dependencies to prevent re-runs

  // No need to return anything since this is only for initialization
}