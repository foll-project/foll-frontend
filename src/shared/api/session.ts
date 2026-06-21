import type { User } from '../../domains/iam/models/user.model';

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem('authUser');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch (err) {
    console.error('Error al parsear authUser desde localStorage:', err);
    localStorage.removeItem('authUser');
    return null;
  }
};

export const getCurrentUserId = (): number | null => {
  const user = getStoredUser();
  if (user?.userId) {
    return Number(user.userId);
  }

  const token = localStorage.getItem('authToken');
  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    const decoded = JSON.parse(atob(payloadBase64));
    return decoded.userId ? parseInt(decoded.userId, 10) : null;
  } catch (error) {
    console.error('Error decodificando el token JWT:', error);
    return null;
  }
};
