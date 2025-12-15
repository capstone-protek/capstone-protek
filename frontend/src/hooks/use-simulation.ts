// src/hooks/use-simulation.ts
import { useState, useEffect, useCallback } from 'react';
import { simulationService } from '../services/api'; 

export function useSimulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Status string untuk UI
  const simulationStatus = isSimulating ? 'running' : 'stopped';

  const checkStatus = useCallback(async () => {
    try {
      const data = await simulationService.getStatus();
      
      if (data && typeof data.is_running !== 'undefined') {
        setIsSimulating(data.is_running);
      }
    } catch (error) {
      console.error("Gagal sync status simulasi", error);
    }
  }, []);

  const startSimulation = async () => {
    try {
      setIsSimulating(true); 
      await simulationService.start();
      checkStatus(); 
    } catch (error) {
      console.error("Gagal start simulasi", error);
      setIsSimulating(false); 
    }
  };

  const stopSimulation = async () => {
    try {
      setIsSimulating(false); 
      await simulationService.stop();
      checkStatus(); 
    } catch (error) {
      console.error("Gagal stop simulasi", error);
    }
  };

  useEffect(() => {
    // FIX: Menggunakan ReturnType<typeof setInterval> menggantikan 'any'
    // Ini cara paling aman dan compliant dengan TypeScript strict mode
    let interval: ReturnType<typeof setInterval> | undefined;

    checkStatus();

    if (isSimulating) {
      interval = setInterval(checkStatus, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, checkStatus]);

  return {
    isSimulating,
    simulationStatus,
    startSimulation,
    stopSimulation
  };
}