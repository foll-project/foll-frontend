import { useState } from 'react';
// 1. Agregamos la palabra "type" aquí para solucionar el error TS1484
import type { AuthCredentials, User } from '../models/user.model'; 

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    try {
      // Simulación de API Gateway
      console.log('Autenticando con encriptación...', credentials);
      setUser({ id: '1', name: 'Maria', email: 'maria@foll.com', role: 'caregiver' });
    } catch (error) {
      // 2. Ahora usamos la variable "error" en el console.error para solucionar el aviso de ESLint
      console.error("Error de autenticación capturado:", error); 
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, login };
};