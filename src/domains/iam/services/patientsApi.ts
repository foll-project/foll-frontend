import { apiClient } from '../../../shared/api/client';
import { API_CONFIG } from '../../../shared/api/config';
import { getCurrentUserId } from '../../../shared/api/session';

export interface PatientDeviceStatus {
  isLinked: boolean;
  deviceId?: number;
  status?: string;
  connectivityStatus?: string | null;
  currentBatteryLevel?: number | null;
  isCharging?: boolean | null;
  lastHeartbeatAt?: string | null;
  isOnline?: boolean;
  isLowBattery?: boolean;
  firmwareVersion?: string;
}

export interface CaregiverPatient {
  patientId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  dni: string;
  isPrincipal: boolean;
  caregiverKind: string;
  device: PatientDeviceStatus;
}

interface BackendDevice {
  isLinked?: boolean;
  deviceId?: number;
  status?: string;
  connectivityStatus?: string | null;
  currentBatteryLevel?: number | null;
  isCharging?: boolean | null;
  lastHeartbeatAt?: string | null;
  isOnline?: boolean;
  isLowBattery?: boolean;
  firmwareVersion?: string;
}

interface BackendPatient {
  patientId?: number;
  firstName?: string;
  lastName?: string;
  dni?: string;
  device?: BackendDevice;
}

interface BackendCaregiverPatientResponse {
  patient?: BackendPatient;
  caregiverKind?: string;
}

const normalizeDevice = (device?: BackendDevice): PatientDeviceStatus => {
  if (!device || device.isLinked !== true) {
    return { isLinked: false };
  }

  return {
    isLinked: true,
    deviceId: device.deviceId,
    status: device.status,
    connectivityStatus: device.connectivityStatus,
    currentBatteryLevel: device.currentBatteryLevel,
    isCharging: device.isCharging,
    lastHeartbeatAt: device.lastHeartbeatAt,
    isOnline: device.isOnline,
    isLowBattery: device.isLowBattery,
    firmwareVersion: device.firmwareVersion,
  };
};

const normalize = (response: BackendCaregiverPatientResponse): CaregiverPatient => {
  const patient = response.patient || {};
  const firstName = patient.firstName || '';
  const lastName = patient.lastName || '';

  return {
    patientId: patient.patientId ?? 0,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || 'Sin nombre',
    dni: patient.dni || '',
    isPrincipal: response.caregiverKind === 'official',
    caregiverKind: response.caregiverKind || 'caregiver',
    device: normalizeDevice(patient.device),
  };
};

export const fetchMyPatients = async (): Promise<CaregiverPatient[]> => {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const response = await apiClient.get<BackendCaregiverPatientResponse[]>(
    API_CONFIG.PATIENTS.GET_BY_CAREGIVER(userId)
  );

  return (response || []).map(normalize);
};
