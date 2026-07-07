import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

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
            <MapPinIcon />
          </span>
          <span className="leading-relaxed">{displayAddress}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-gray-200 shadow-sm ${className}`}>
      <div ref={containerRef} className="h-44 w-full z-0" />
      <div className="bg-white px-4 py-3 flex items-start gap-2 text-xs font-semibold text-gray-700 border-t border-gray-100">
        <span className="mt-0.5 shrink-0 text-[#16333F]">
          <MapPinIcon />
        </span>
        <span className="leading-relaxed">{displayAddress}</span>
      </div>
    </div>
  );
}
