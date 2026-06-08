import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { invitationsApi } from '../services/invitationsApi';
import { createInvitationHubConnection } from '../services/invitationHub';
import type { Invitation, InvitationRealtimeEvent } from '../models/invitation.model';
import { InvitationsContext } from './InvitationsContext';
import type { InvitationsContextValue } from './InvitationsContext';

export const InvitationsProvider = ({ children }: { children: ReactNode }) => {
  const [received, setReceived] = useState<Invitation[]>([]);
  const [sent, setSent] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<InvitationRealtimeEvent | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);

  const refreshAll = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    setIsLoading(true);
    try {
      const [receivedData, sentData] = await Promise.all([
        invitationsApi.getReceived(),
        invitationsApi.getSent(),
      ]);
      setReceived(receivedData);
      setSent(sentData);
    } catch (error) {
      console.warn('No se pudieron cargar las invitaciones.', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopConnection = useCallback(async () => {
    const connection = connectionRef.current;
    connectionRef.current = null;
    setIsConnected(false);

    if (!connection) return;

    try {
      await connection.stop();
    } catch (error) {
      console.warn('No se pudo detener SignalR de invitaciones.', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    let isMounted = true;

    const start = async () => {
      await refreshAll();

      if (!isMounted || !localStorage.getItem('authToken')) return;

      const connection = createInvitationHubConnection((event) => {
        setLastEvent(event);
        // Cualquier evento (creada/aceptada/rechazada) altera las listas: refrescamos.
        void refreshAll();
      });

      connectionRef.current = connection;

      try {
        await connection.start();
        if (isMounted) setIsConnected(true);
      } catch (error) {
        console.warn('No se pudo iniciar SignalR de invitaciones.', error);
        if (isMounted) setIsConnected(false);
      }
    };

    void start();

    return () => {
      isMounted = false;
      void stopConnection();
    };
  }, [refreshAll, stopConnection]);

  const accept = useCallback(async (id: number) => {
    await invitationsApi.accept(id);
    await refreshAll();
  }, [refreshAll]);

  const reject = useCallback(async (id: number) => {
    await invitationsApi.reject(id);
    await refreshAll();
  }, [refreshAll]);

  const createInvitation = useCallback(async (dni: string, relationshipTypeId: number) => {
    await invitationsApi.create(dni, relationshipTypeId);
    await refreshAll();
  }, [refreshAll]);

  const dismissEvent = useCallback(() => setLastEvent(null), []);

  const logoutInvitations = useCallback(async () => {
    await stopConnection();
    setReceived([]);
    setSent([]);
    setLastEvent(null);
  }, [stopConnection]);

  const pendingReceivedCount = useMemo(
    () => received.filter((invitation) => invitation.status === 'Pending').length,
    [received],
  );

  const value = useMemo<InvitationsContextValue>(() => ({
    received,
    sent,
    pendingReceivedCount,
    isLoading,
    isConnected,
    lastEvent,
    dismissEvent,
    refreshAll,
    accept,
    reject,
    createInvitation,
    logoutInvitations,
  }), [
    received,
    sent,
    pendingReceivedCount,
    isLoading,
    isConnected,
    lastEvent,
    dismissEvent,
    refreshAll,
    accept,
    reject,
    createInvitation,
    logoutInvitations,
  ]);

  return (
    <InvitationsContext.Provider value={value}>
      {children}
    </InvitationsContext.Provider>
  );
};
