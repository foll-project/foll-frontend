export interface FaqItem {
  id: string;
  category: 'general' | 'dispositivo' | 'alertas' | 'cuidadores';
}

export const FAQ_ITEMS: FaqItem[] = [
  { id: 'que-es-foll', category: 'general' },
  { id: 'registrar-abuelito', category: 'general' },
  { id: 'vincular-dispositivo', category: 'dispositivo' },
  { id: 'telemetria-vivo', category: 'dispositivo' },
  { id: 'dispositivo-offline', category: 'dispositivo' },
  { id: 'bateria-baja', category: 'dispositivo' },
  { id: 'alerta-caida', category: 'alertas' },
  { id: 'atender-vs-falsa', category: 'alertas' },
  { id: 'varios-cuidadores-alerta', category: 'alertas' },
  { id: 'historial-reportes', category: 'alertas' },
  { id: 'invitar-cuidador', category: 'cuidadores' },
  { id: 'roles-cuidador', category: 'cuidadores' },
  { id: 'codigo-qr', category: 'cuidadores' },
];

export const CONTACT_INFO = {
  email: 'maurxio2@gmail.com',
  phone: '+51 920648634',
  phoneHref: '+51920648634',
} as const;
