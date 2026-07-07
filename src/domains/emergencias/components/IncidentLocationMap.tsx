import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

/** Opción A: destino = texto de dirección (mismo que la UI); si no hay, coordenadas. */
const buildGoogleMapsDirectionsUrl = (
  latitude: number,
  longitude: number,
  address?: string | null,
): string => {
  const trimmed = address?.trim();
  const destination = trimmed ? encodeURIComponent(trimmed) : `${latitude},${longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
};

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface IncidentLocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  className?: string;
}

const hasValidCoordinates = (lat?: number | null, lng?: number | null): lat is number =>
  lat != null &&
  lng != null &&
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  !(lat === 0 && lng === 0);

export default function IncidentLocationMap({
  latitude,
  longitude,
  address,
  className = '',
}: IncidentLocationMapProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const coordsValid = hasValidCoordinates(latitude, longitude);
  const displayAddress =
    address?.trim() ||
    (coordsValid
      ? t('historial.coordinatesFallback', {
        lat: latitude.toFixed(5),
        lng: longitude!.toFixed(5),
      })
      : t('historial.locationUnavailable'));

  const directionsUrl = useMemo(() => {
    if (!coordsValid) return null;
    return buildGoogleMapsDirectionsUrl(latitude, longitude!, address);
  }, [latitude, longitude, address, coordsValid]);

  useEffect(() => {
    if (!coordsValid || !containerRef.current) {
      return;
    }

    const lat = latitude;
    const lng = longitude!;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 16,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);

      markerRef.current = L.marker([lat, lng], { icon: defaultIcon }).addTo(mapRef.current);
    } else {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
      markerRef.current?.setLatLng([lat, lng]);
    }

    const popupText = address?.trim() || displayAddress;
    markerRef.current?.bindPopup(popupText).openPopup();

    requestAnimationFrame(() => {
      mapRef.current?.invalidateSize();
    });
  }, [latitude, longitude, address, coordsValid, displayAddress]);

  useEffect(() => {
    return () => {
      markerRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (!coordsValid) {
    return (
      <div className={`relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 ${className}`}>
        <div className="h-44 flex items-center justify-center bg-gradient-to-br from-[#89BAAF]/20 to-[#16333F]/10 px-4">
          <p className="text-xs font-semibold text-gray-500 text-center">{t('historial.mapUnavailable')}</p>
        </div>
        <div className="bg-white px-4 py-3 flex items-start gap-2 text-xs font-semibold text-gray-700 border-t border-gray-100">
          <span className="mt-0.5 shrink-0 text-[#16333F]">
            <MapPin size={14} strokeWidth={2.25} />
          </span>
          <span className="leading-relaxed">{displayAddress}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-gray-200 shadow-sm ${className}`}>
      <div ref={containerRef} className="h-44 w-full z-0" />
      <div className="bg-white border-t border-gray-100 px-4 py-3 space-y-3">
        <div className="flex items-start gap-2.5 text-xs font-semibold text-gray-700">
          <span className="mt-0.5 shrink-0 text-[#16333F]">
            <MapPin size={15} strokeWidth={2.25} />
          </span>
          <span className="leading-relaxed">{displayAddress}</span>
        </div>
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t('historial.viewRouteHint')}
            aria-label={t('historial.viewRouteHint')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16333F] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#1f4a5c] hover:shadow-md active:scale-[0.98]"
          >
            <Navigation size={15} strokeWidth={2.5} className="shrink-0" />
            {t('historial.viewRoute')}
          </a>
        )}
      </div>
    </div>
  );
}
