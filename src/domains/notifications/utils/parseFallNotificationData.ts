export interface FallNotificationData {
  fallTypeName?: string;
  confidence?: string;
  latitude?: string;
  longitude?: string;
  address?: string;
  incidentKey?: string;
  deviceId?: string;
  patientId?: string;
}

export const parseFallNotificationData = (dataJson?: string | null): FallNotificationData => {
  if (!dataJson) return {};
  try {
    const d = JSON.parse(dataJson) as Record<string, string>;
    return {
      fallTypeName: d.fallTypeName || d.fall_type || undefined,
      confidence: d.aiConfidenceScore || undefined,
      latitude: d.latitude || undefined,
      longitude: d.longitude || undefined,
      address: d.address?.trim() || d.location?.trim() || undefined,
      incidentKey: d.incidentKey || undefined,
      deviceId: d.deviceId || undefined,
      patientId: d.patientId || undefined,
    };
  } catch {
    return {};
  }
};

export const hasFallCoordinates = (data: FallNotificationData): boolean => {
  if (!data.latitude || !data.longitude) return false;
  const lat = parseFloat(data.latitude);
  const lng = parseFloat(data.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
};
