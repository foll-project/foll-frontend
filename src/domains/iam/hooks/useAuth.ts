import { useState, useEffect } from 'react';
import type { LoginCredentials, RegisterData, User } from '../models/user.model';
import { apiClient } from '../../../shared/api/client';
import { API_CONFIG } from '../../../shared/api/config';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Verificar si hay un usuario guardado al cargar el componente
  useEffect(() => {
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error al parsear usuario guardado:', err);
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  // LOGIN: Enviar credenciales a la API
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<User>(
        API_CONFIG.AUTH.LOGIN,
        credentials
      );

      // Guardar usuario en estado
      setUser(response);

      // Guardar token en localStorage
      localStorage.setItem('authToken', response.token);

      // Guardar usuario completo en localStorage (para persistencia)
      localStorage.setItem('authUser', JSON.stringify(response));

      console.log('✓ Login exitoso:', response.email);
      return response;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error 
        ? err.message 
        : 'Error en la autenticación';
      setError(errorMsg);
      console.error('✗ Error login:', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTRO: Enviar datos de registro a la API
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<User>(
        API_CONFIG.AUTH.REGISTER,
        data
      );

      // Guardar usuario en estado
      setUser(response);

      // Guardar token en localStorage
      localStorage.setItem('authToken', response.token);

      // Guardar usuario completo en localStorage
      localStorage.setItem('authUser', JSON.stringify(response));

      console.log('✓ Registro exitoso:', response.email);
      return response;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error 
        ? err.message 
        : 'Error en el registro';
      setError(errorMsg);
      console.error('✗ Error registro:', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // LOGOUT: Limpiar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setError(null);
    console.log('✓ Logout exitoso');
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = !!user && !!localStorage.getItem('authToken');

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
  };
};