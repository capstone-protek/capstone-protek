// src/hooks/use-simulation.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api'; // Import dari file api yang baru kita buat

export function useSimulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string>('idle');

  const checkStatus = useCallback(async () => {
    const data = await api.getSimulationStatus();
    if (data) {
      setSimulationStatus(data.status || 'unknown');
      
      if (data.status === 'running' && !isSimulating) setIsSimulating(true);
      if (data.status !== 'running' && isSimulating) setIsSimulating(false);
    }
  }, [isSimulating]);

  const startSimulation = async () => {
    setIsSimulating(true);
    await api.startSimulation();
    checkStatus(); 
  };

  const stopSimulation = async () => {
    setIsSimulating(false);
    await api.stopSimulation();
    checkStatus(); 
  };

  useEffect(() => {
    // KITA UBAH TIPE INI JADI 'any' AGAR ERROR 'Cannot find namespace NodeJS' HILANG
    let interval: any; 
    
    checkStatus();

    if (isSimulating) {
      interval = setInterval(checkStatus, 2000);
    }

    return () => clearInterval(interval);
  }, [isSimulating, checkStatus]);

  return {
    isSimulating,
    simulationStatus,
    startSimulation,
    stopSimulation
  };
}