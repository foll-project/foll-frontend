export interface User {
  id: string;
  name: string;
  email: string;
  role: 'caregiver' | 'admin';
}

export interface AuthCredentials {
  email: string; 
  password: string;
}
export interface QuickAccessProfile {
  id: string;
  name: string;
  role: 'Cuidador Principal' | 'Cuidador Secundario' | 'Invitado';
}