/**
 * Validaciones core y utilitarias para formularios de la aplicación FOLL
 */

export const VALIDATION_REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  DNI_PERU: /^\d{8}$/,
  PHONE: /^(\+?51)?9\d{8}$|^(\+?\d{8,15})$/,
  NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{2,100}$/,
  INTEGER_POSITIVE: /^[1-9]\d*$/,
} as const;

export const isValidEmail = (email: string): boolean => {
  return VALIDATION_REGEX.EMAIL.test(email.trim());
};

export const isValidDni = (dni: string): boolean => {
  return VALIDATION_REGEX.DNI_PERU.test(dni.trim());
};

export const isValidPhone = (phone: string): boolean => {
  const clean = phone.replace(/[\s-]/g, '');
  return VALIDATION_REGEX.PHONE.test(clean);
};

export const isValidName = (name: string): boolean => {
  return VALIDATION_REGEX.NAME.test(name.trim());
};

/**
 * Valida que la edad de un adulto mayor sea un número entero realista.
 * Por defecto entre 50 y 125 años.
 */
export const isValidAge = (age: string | number, min = 50, max = 125): boolean => {
  if (typeof age === 'string' && !/^\d+$/.test(age.trim())) return false;
  const num = Number(age);
  return Number.isInteger(num) && num >= min && num <= max;
};

/**
 * Valida que el código del hardware (ID de dispositivo cinturón) sea un ID positivo válido (ej: 1001)
 */
export const isValidDeviceId = (deviceId: string | number): boolean => {
  if (typeof deviceId === 'string' && !VALIDATION_REGEX.INTEGER_POSITIVE.test(deviceId.trim())) {
    return false;
  }
  const num = Number(deviceId);
  return Number.isInteger(num) && num > 0 && num <= 99999999;
};

export const isValidPassword = (password: string, minLength = 6): boolean => {
  return Boolean(password && password.length >= minLength);
};

