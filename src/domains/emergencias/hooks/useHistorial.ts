import { useState, useEffect } from 'react';
import type { EventoCaida } from '../models/evento.model';

export const useHistorial = () => {
  const [eventos, setEventos] = useState<EventoCaida[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para el evento seleccionado (panel derecho)
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoCaida | null>(null);

  useEffect(() => {
    const fetchEventos = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulación API Gateway

      const mockData: EventoCaida[] = [
        {
          id: '1', ref: '#EVT-84729', fecha: '12 Oct 2026', hora: '14:30 hrs',
          paciente: 'Rosa Martínez', tipo: 'Emergencia Real', tiempoRespuesta: '2m 14s',
          ubicacion: 'Sala de estar, Residencia Principal',
          tipoCaida: 'Mecánica',
          observaciones: 'Perdió el equilibrio al intentar levantarse del sillón. No se hubo contusiones severas.El médico recomendó revisar su presión arterial en la próxima visita.',
          anotacionesPaciente: [
            { id: 'a1', fecha: '11 Oct 2026, 09:00', texto: 'La abuelita se quejó de un dolor de cabeza fuerte en la mañana.', autor: 'María Gonzales' },
            { id: 'a2', fecha: '09 Oct 2026, 18:30', texto: 'No quiso cenar, dijo sentirse mareada.', autor: 'Juan Silva' }
          ]
        },
        {
          id: '2', ref: '#EVT-84730', fecha: '10 Oct 2026', hora: '09:15 hrs',
          paciente: 'Carlos Vega', tipo: 'Falso Positivo', ubicacion: 'Pasillo central',
          observaciones: 'Movimiento brusco al agacharse a recoger un objeto. El sistema filtró correctamente tras 5 segundos de validación.'
        },
        {
          id: '3', ref: '#EVT-84731', fecha: '01 Oct 2026', hora: '11:40 hrs',
          paciente: 'Elena Torres', tipo: 'Falso Positivo', ubicacion: 'Jardín exterior',
          observaciones: 'Sensor detectó anomalía menor en el patrón de marcha. Descartado automáticamente.'
        }
      ];

      setEventos(mockData);
      setEventoSeleccionado(mockData[0]); // Seleccionamos el primero por defecto
      setIsLoading(false);
    };

    fetchEventos();
  }, []);

  const seleccionarEvento = (evento: EventoCaida) => {
    setEventoSeleccionado(evento);
  };

  return {
    eventos,
    isLoading,
    detalle: {
      eventoSeleccionado,
      seleccionarEvento
    }
  };
};