import { useState, useEffect } from 'react';
import type { QuickAccessProfile } from '../../iam/models/user.model';
import type { SecurityStats } from '../models/stats.model';

interface InicioData {
  profiles: QuickAccessProfile[];
  stats: SecurityStats;
}

export const useInicio = () => {
  const [data, setData] = useState<InicioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInicioData = async () => {
      setIsLoading(true);
      
      // Simulación de latencia de red (API Gateway)
      await new Promise(resolve => setTimeout(resolve, 600)); 

      setData({
        profiles: [
          { id: '1', name: 'Don Roberto', role: 'Cuidador Principal' },
          { id: '2', name: 'Doña Carmen', role: 'Cuidador Secundario' }
        ],
        stats: {
          month: 'Mes Actual',
          totalEvents: 12,
          realFalls: 2,
          falsePositives: 10,
          summaryMessage: 'El sistema ha filtrado eficazmente la mayoría de los eventos, manteniendo la tranquilidad en el entorno de cuidado.'
        }
      });
      
      setIsLoading(false);
    };

    fetchInicioData();
  }, []);

  return { data, isLoading };
};