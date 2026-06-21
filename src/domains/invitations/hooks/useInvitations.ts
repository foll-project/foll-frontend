import { useContext } from 'react';
import { InvitationsContext } from '../context/InvitationsContext';

export const useInvitations = () => {
  const context = useContext(InvitationsContext);

  if (!context) {
    throw new Error('useInvitations debe usarse dentro de InvitationsProvider');
  }

  return context;
};
