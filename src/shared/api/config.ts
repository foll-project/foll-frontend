// Configuración de la API
// Cambiar VITE_API_URL según tu entorno

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5237http://localhost:8080/api/monolito';

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
    DELETE: (id: number) => `/api/care/patients/${id}`,
    GET_MONTHLY_FALLS: (patientId: number, month: number, year: number) => `/api/emergency/incidents/history/patient/${patientId}/monthly?month=${month}&year=${year}`,
    
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
    REMOVE_CAREGIVER: (patientId: number, caregiverId: number) => `/api/patients/${patientId}/caregivers/${caregiverId}`,
    GET_BY_CAREGIVER: (caregiverUserId: number) => `/api/care/patients/by-caregiver/${caregiverUserId}`,
  },

  // Endpoints de Invitaciones (Care)
  INVITATIONS: {
    RECEIVED: '/api/care/invitations/received',
    SENT: '/api/care/invitations/sent',
    ACCEPT: (id: number) => `/api/care/invitations/${id}/accept`,
    REJECT: (id: number) => `/api/care/invitations/${id}/reject`,
    CREATE: (dni: string) => `/api/care/patients/${dni}/invitations`,
  },

  DEVICES: {
    LINK: (deviceId: number) => `/api/devices/${deviceId}/link`,
    UNLINK: (deviceId: number) => `/api/devices/${deviceId}/link`,
    STATUS: (deviceId: number) => `/api/devices/${deviceId}/status`,
    BY_PATIENT: (patientId: number) => `/api/devices/patient/${patientId}`,
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

  // Endpoints de Incidentes de Emergencia (EmergencyAnalytics)
  EMERGENCY: {
    ACTIVE_BY_PATIENT: (patientId: number) => `/api/emergency/incidents/active/patient/${patientId}`,
    HISTORY_BY_PATIENT: (patientId: number) => `/api/emergency/incidents/history/patient/${patientId}`,
    GET_ONE: (incidentId: number) => `/api/emergency/incidents/${incidentId}`,
    RESOLVE: (incidentId: number) => `/api/emergency/incidents/${incidentId}/resolve`,
    FALSE_POSITIVE: (incidentId: number) => `/api/emergency/incidents/${incidentId}/false-positive`,
  },

};
