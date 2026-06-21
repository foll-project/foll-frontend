// ========== USUARIO AUTENTICADO ==========
export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  token: string;
}

// ========== CREDENCIALES LOGIN ==========
export interface LoginCredentials {
  email: string;
  password: string;
}

// ========== DATOS REGISTRO ==========
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

// ========== CREDENCIALES AUTH (para compatibilidad) ==========
export interface AuthCredentials {
  email: string;
  password: string;
}

// ========== PERFIL DE ACCESO RÁPIDO ==========
export interface QuickAccessProfile {
  id: string;
  name: string;
  role: 'Cuidador Principal' | 'Cuidador Secundario' | 'Invitado';
}