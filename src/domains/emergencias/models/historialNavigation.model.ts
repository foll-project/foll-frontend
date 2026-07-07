export interface HistorialFocusState {
  selectIncidentId?: number;
  refreshAt?: number;
}

export const buildHistorialFocusState = (selectIncidentId?: number): HistorialFocusState => ({
  selectIncidentId,
  refreshAt: Date.now(),
});
