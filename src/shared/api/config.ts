// Configuración de la API
// Cambiar VITE_API_URL según tu entorno

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5237';

if (!import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL no está definido. Usando http://localhost:5237 como fallback.');
}

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  
  // Endpoints de IAM/Auth
  AUTH: {
    LOGIN: '/api/iam/auth/login',
    REGISTER: '/api/iam/auth/register',
    LOGOUT: '/api/iam/auth/logout',
  },
  
  // Endpoints de Patients (Abuelitos)
  PATIENTS: {
    CREATE: '/api/care/patients',
    GET_ONE: (id: number) => `/api/care/patients/${id}`,
    UPDATE: (id: number) => `/api/care/patients/${id}`,
    
    // Guardian Management
    CHANGE_GUARDIAN: (id: number) => `/api/care/patients/${id}/guard-shift`,
    RESTORE_GUARDIAN: (id: number) => `/api/care/patients/${id}/guard-shift/restore`,
    
    // Emergency Contacts
    CREATE_EMERGENCY_CONTACT: (id: number) => `/api/care/patients/${id}/emergency-contacts`,
    DELETE_EMERGENCY_CONTACT: (id: number, contactId: number) => `/api/care/patients/${id}/emergency-contacts/${contactId}`,
    
    // Annotations
    CREATE_ANNOTATION: (id: number) => `/api/care/patients/${id}/annotations`,
    GET_ANNOTATIONS: (id: number) => `/api/care/patients/${id}/annotations`,
    
    // Invitations
    CREATE_INVITATION: (dni: string) => `/api/care/patients/${dni}/invitations`,
    
    // Relationships
    GET_CAREGIVERS: (id: number) => `/api/care/patients/${id}/caregivers`,
    GET_BY_CAREGIVER: (caregiverUserId: number) => `/api/care/patients/by-caregiver/${caregiverUserId}`,
  },

  NOTIFICATIONS: {
    LIST: '/api/notifications',
    GET_ONE: (id: number) => `/api/notifications/${id}`,
    DELIVERY_STATUS: (id: number) => `/api/notifications/${id}/delivery-status`,
    MARK_AS_READ: (id: number) => `/api/notifications/${id}/read`,
    ACKNOWLEDGE: (id: number) => `/api/notifications/${id}/acknowledge`,
    PUSH_TOKENS: '/api/notifications/push-tokens',
    DELETE_PUSH_TOKEN: (id: number) => `/api/notifications/push-tokens/${id}`,
  },
  
};
