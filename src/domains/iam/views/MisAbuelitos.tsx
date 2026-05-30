import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAbuelitos } from "../hooks/useAbuelitos";
import { Modal } from "../../../shared/components/modals/Modal";
import type { RegistrarAbuelitoDTO, Abuelito } from "../models/abuelito.model";

// Íconos SVG
const QRIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h7v7h-7z" />
    <path d="M14 14v-3M17 14h3M21 21v-3M14 21h3" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    className="text-[#2E7D32]"
  >
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
);
const UsersIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const AddUserIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);
const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);
const CpuIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);
const BatteryIcon = ({
  level,
  charging,
}: {
  level: number;
  charging: boolean;
}) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={level <= 20 && !charging ? "text-red-500" : "text-green-500"}
  >
    <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
    <line x1="22" y1="11" x2="22" y2="13" />
    {charging ? (
      <polyline
        points="11 7 8 12 14 12 11 17"
        className="text-yellow-500"
        fill="currentColor"
      />
    ) : (
      <rect
        x="4"
        y="9"
        width={12 * (level / 100)}
        height="6"
        fill="currentColor"
        stroke="none"
      />
    )}
  </svg>
);
const LinkIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);
const ShieldCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ShieldXIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="9" y1="9" x2="15" y2="15" />
    <line x1="15" y1="9" x2="9" y2="15" />
  </svg>
);
/*const TransferIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6" />
  </svg>
);*/
const NoteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

export default function MisAbuelitos() {
  const { abuelitos, solicitudes, isLoading, modals, detalles, handlers } =
    useAbuelitos();
  const location = useLocation();
  const navigate = useNavigate();

  const [dniVincularFamiliar, setDniVincularFamiliar] = useState("");
  const [codigoHardware, setCodigoHardware] = useState("");
  const [formRegistro, setFormRegistro] = useState<RegistrarAbuelitoDTO>({
    nombre: "",
    dni: "",
    edad: "",
    grupoSanguineo: "",
    enfermedades: [],
    medicamentos: [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Abuelito>>({});
  const [nuevaAnotacion, setNuevaAnotacion] = useState("");

  useEffect(() => {
    if (location.state?.openRegisterModal) {
      modals.setIsRegistrarOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, modals]);

  /*const handleAbrirDetallesPerfil = (id: string) => {
    setIsEditing(false);
    setShowDeleteConfirm(false);
    handlers.abrirDetallesPerfil(id);
  };*/

  const handleIniciarEdicion = () => {
    if (detalles.abuelitoSeleccionado)
      setEditForm(detalles.abuelitoSeleccionado);
    setIsEditing(true);
  };

  if (isLoading)
    return (
      <div className="h-full flex items-center justify-center font-bold text-[#16333F]">
        Cargando abuelitos...
      </div>
    );

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-10">
      {/* --- CABECERA --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#16333F] mb-2">
            Mis Abuelitos
          </h1>
          <p className="text-sm text-gray-500">
            Gestiona el monitoreo y accesos de tus familiares.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => modals.setIsVincularOpen(true)}
            className="bg-[#FDECA6] hover:bg-[#FCE07B] text-[#16333F] px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
          >
            Vincular Familiar
          </button>
          <button
            onClick={() => modals.setIsRegistrarOpen(true)}
            className="bg-[#3D5665] hover:bg-[#16333F] text-white px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors shadow-md"
          >
            <AddUserIcon /> Registrar Abuelito
          </button>
        </div>
      </div>

      {/* --- GRID PRINCIPAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Tarjetas de Abuelitos */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {abuelitos.map((abuelito) => {
            const isPendiente = abuelito.estadoVinculacion === "Pendiente";
            const isOnline = abuelito.dispositivo?.estadoGeneral === "Online";

            return (
              <div
                key={abuelito.id}
                className={`bg-white rounded-3xl p-6 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.06)] border flex flex-col justify-between relative overflow-hidden min-h-[220px] ${isPendiente ? "border-dashed border-gray-300 bg-gray-50/50" : "border-gray-50"}`}
              >
                {/* Fondo Decorativo */}
                {!isPendiente && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9F7F1] rounded-bl-full -z-0"></div>
                )}

                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h3
                      className={`text-lg font-bold ${isPendiente ? "text-gray-500" : "text-[#16333F]"}`}
                    >
                      {abuelito.nombre}
                    </h3>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold px-3 py-1 rounded-full ${abuelito.rol === "Principal" && !isPendiente ? "bg-[#FDF5D3] text-[#DCA646]" : "bg-gray-200 text-gray-500"}`}
                    >
                      {abuelito.rol}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {!isPendiente && (
                      <button className="p-2 bg-white border border-gray-100 text-gray-400 hover:text-[#16333F] hover:bg-gray-50 rounded-lg transition-colors shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]" title="Código QR">
                        <QRIcon />
                      </button>
                    )}
                    {!isPendiente && abuelito.dispositivo && (
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full shadow-sm border border-gray-100">
                        <span
                          className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                        ></span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase">
                          {isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isPendiente ? (
                  /* VISTA: PENDIENTE DE VINCULACIÓN */
                  <div className="flex flex-col items-center justify-center flex-1 mt-4 relative z-10">
                    <p className="text-xs text-gray-400 text-center mb-3">
                      Pendiente a vinculación con el hardware
                    </p>
                    <button
                      onClick={() =>
                        handlers.abrirVincularHardware(abuelito.id)
                      }
                      className="flex items-center gap-2 bg-[#FDECA6] hover:bg-[#FCE07B] text-[#16333F] px-4 py-2 rounded-xl text-xs font-bold transition-colors w-full justify-center"
                    >
                      <LinkIcon /> Vincular Dispositivo
                    </button>
                  </div>
                ) : (
                  /* VISTA: VINCULADO / ACTIVO */
                  <>
                    <div className="flex justify-between items-end relative z-10 mt-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 mb-1">
                          Estado del Paciente
                        </p>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[#16333F]">
                          <CheckCircleIcon /> {abuelito.estadoActual}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 mb-1">
                          Último Reporte
                        </p>
                        <p className="text-sm font-bold text-[#16333F]">
                          {abuelito.ultimoReporte}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-5 relative z-10">
                      {/* Fila 1 */}
                      <button onClick={() => handlers.abrirDetallesPerfil(abuelito.id)} className="w-full border border-[#16333F] text-[#16333F] hover:bg-[#16333F] hover:text-white rounded-xl py-2 text-[11px] font-bold transition-colors">
                        Perfil
                      </button>
                      {/* Fila 2 */}
                      <div className="flex gap-2">
                        <button onClick={() => handlers.abrirDetallesDispositivo(abuelito.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-[#F9F7F1] border border-gray-200 text-[#16333F] hover:bg-gray-100 rounded-xl py-2 text-[11px] font-bold transition-colors">
                          <CpuIcon /> Dispositivo
                        </button>
                        <button onClick={() => handlers.abrirBitacora(abuelito.id)} className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-[#16333F] hover:bg-gray-50 rounded-xl py-2 text-[11px] font-bold transition-colors">
                          <NoteIcon /> Anotaciones
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Solicitudes Pendientes */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[#16333F] font-bold text-base flex items-center gap-2">
              <UsersIcon /> Solicitudes Pendientes
            </h3>
            {solicitudes.length > 0 && (
              <span className="bg-[#FFEBEE] text-[#C62828] text-[10px] font-bold px-2 py-1 rounded-md">
                {solicitudes.length} Nuevas
              </span>
            )}
          </div>
          <div className="space-y-6">
            {solicitudes.map((solicitud) => (
              <div
                key={solicitud.id}
                className="border-b border-gray-100 pb-5 last:border-0 last:pb-0"
              >
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  <span className="font-bold text-[#16333F]">
                    {solicitud.solicitante}
                  </span>{" "}
                  solicita acceso para ver a{" "}
                  <span className="font-bold text-[#16333F] underline decoration-[#89BAAF] decoration-2 underline-offset-2">
                    {solicitud.abuelitoObjetivo}
                  </span>
                  .
                </p>
                <div className="flex gap-3">
                  <button className="flex-1 bg-[#3D5665] hover:bg-[#16333F] text-white rounded-lg py-2 text-xs font-bold transition-colors">
                    Aprobar
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded-lg py-2 text-xs font-bold transition-colors">
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODAL: Vincular Familiar (Por DNI) --- */}
      <Modal
        isOpen={modals.isVincularOpen}
        onClose={() => modals.setIsVincularOpen(false)}
        title="Vincular Familiar"
      >
        <p className="text-sm text-gray-500 mb-5">
          Ingresa el DNI del adulto mayor para enviar una solicitud al Cuidador
          Principal.
        </p>
        <input
          type="text"
          placeholder="Ej. 12345678"
          value={dniVincularFamiliar}
          onChange={(e) => setDniVincularFamiliar(e.target.value)}
          className="w-full px-4 py-3 bg-[#F9F7F1] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16333F] mb-6"
        />
        <button
          onClick={() => handlers.handleVincularFamiliar(dniVincularFamiliar)}
          className="w-full bg-[#FDECA6] hover:bg-[#FCE07B] text-[#16333F] py-3 rounded-xl font-bold transition-colors"
        >
          Enviar Solicitud
        </button>
      </Modal>

      {/* --- NUEVO MODAL: Vincular Hardware --- */}
      <Modal
        isOpen={modals.isVincularHardwareOpen}
        onClose={() => {
          modals.setIsVincularHardwareOpen(false);
          setCodigoHardware("");
        }}
        title="Vincular Dispositivo"
      >
        <p className="text-sm text-gray-500 mb-5">
          Ingresa el ID único impreso en la parte inferior del hardware asignado
          a{" "}
          <span className="font-bold text-[#16333F]">
            {detalles.abuelitoSeleccionado?.nombre}
          </span>
          .
        </p>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <CpuIcon />
          </div>
          <input
            type="text"
            placeholder="Ej. ESP32-A8F9"
            value={codigoHardware}
            onChange={(e) => setCodigoHardware(e.target.value.toUpperCase())}
            className="w-full pl-10 pr-4 py-3 bg-[#F9F7F1] border border-gray-200 rounded-xl text-sm font-mono uppercase outline-none focus:border-[#16333F]"
          />
        </div>
        <button
          onClick={() => {
            handlers.handleVincularHardwareSubmit(codigoHardware);
            setCodigoHardware("");
          }}
          className="w-full bg-[#3D5665] hover:bg-[#16333F] text-white py-3 rounded-xl font-bold transition-colors shadow-md"
        >
          Vincular y Activar Monitoreo
        </button>
      </Modal>

      {/* --- NUEVO MODAL: Detalles del Dispositivo --- */}
      <Modal
        isOpen={modals.isDispositivoOpen}
        onClose={() => modals.setIsDispositivoOpen(false)}
        title="Telemetría del Dispositivo"
      >
        {detalles.abuelitoSeleccionado?.dispositivo && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#F9F7F1] p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                  ID de Hardware
                </p>
                <p className="text-base font-mono font-bold text-[#16333F]">
                  {detalles.abuelitoSeleccionado.dispositivo.id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                  Estado de Red
                </p>
                <div className="flex items-center gap-1.5 justify-end">
                  <span
                    className={`w-2 h-2 rounded-full ${detalles.abuelitoSeleccionado.dispositivo.estadoGeneral === "Online" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                  ></span>
                  <span className="text-sm font-bold text-[#16333F]">
                    {detalles.abuelitoSeleccionado.dispositivo.estadoGeneral}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="text-xs font-bold text-[#16333F] mb-4 border-b border-gray-100 pb-2">
                Estado de Energía
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BatteryIcon
                    level={detalles.abuelitoSeleccionado.dispositivo.bateria}
                    charging={
                      detalles.abuelitoSeleccionado.dispositivo.cargando
                    }
                  />
                  <div>
                    <p className="text-xl font-black text-[#16333F] leading-none">
                      {detalles.abuelitoSeleccionado.dispositivo.bateria}%
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 font-medium">
                      {detalles.abuelitoSeleccionado.dispositivo.cargando
                        ? "Cargando actualmente..."
                        : "Descargando"}
                    </p>
                  </div>
                </div>
                {detalles.abuelitoSeleccionado.dispositivo.bateria <= 20 &&
                  !detalles.abuelitoSeleccionado.dispositivo.cargando && (
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-red-100">
                      Requiere Carga
                    </span>
                  )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* --- NUEVO MODAL: Añadir Anotación Rápida --- */}
      <Modal
        isOpen={modals.isAnotacionOpen}
        onClose={() => {
          modals.setIsAnotacionOpen(false);
          setNuevaAnotacion("");
        }}
        title="Añadir Anotación Rápida"
      >
        <p className="text-sm text-gray-500 mb-5">
          Escribe una nota rápida para el registro médico de{" "}
          <span className="font-bold text-[#16333F]">
            {detalles.abuelitoSeleccionado?.nombre}
          </span>
          .
        </p>
        <textarea
          placeholder="Ej. Hoy amaneció con dolor de cabeza..."
          value={nuevaAnotacion}
          onChange={(e) => setNuevaAnotacion(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-[#F9F7F1] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16333F] mb-6 resize-none"
        />
        <button
          onClick={() => {
            if (detalles.abuelitoSeleccionado && nuevaAnotacion.trim()) {
              handlers.handleAñadirAnotacion(detalles.abuelitoSeleccionado.id, nuevaAnotacion);
              setNuevaAnotacion("");
            }
          }}
          className="w-full bg-[#DCA646] hover:bg-[#B8860B] text-white py-3 rounded-xl font-bold transition-colors shadow-md"
        >
          Guardar Anotación
        </button>
      </Modal>

      {/* --- NUEVO MODAL: Ver Bitácora --- */}
      <Modal
        isOpen={modals.isBitacoraOpen}
        onClose={() => modals.setIsBitacoraOpen(false)}
        title="Bitácora de Cuidado"
      >
        <p className="text-sm text-gray-500 mb-5">
          Historial de anotaciones médicas para{" "}
          <span className="font-bold text-[#16333F]">
            {detalles.abuelitoSeleccionado?.nombre}
          </span>
          .
        </p>
        <button
          onClick={() => {
            modals.setIsBitacoraOpen(false);
            if (detalles.abuelitoSeleccionado) {
              handlers.abrirAnotacion(detalles.abuelitoSeleccionado.id);
            }
          }}
          className="w-full mb-5 bg-[#FDECA6] hover:bg-[#FCE07B] text-[#16333F] py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
        >
          <NoteIcon /> Añadir Nueva Anotación
        </button>
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          {detalles.abuelitoSeleccionado?.anotaciones && detalles.abuelitoSeleccionado.anotaciones.length > 0 ? (
            detalles.abuelitoSeleccionado.anotaciones.map((nota) => (
              <div key={nota.id} className="bg-[#F9F7F1] p-4 rounded-xl border border-gray-200 shadow-sm relative">
                <div className="absolute top-4 left-0 w-1 h-8 bg-[#DCA646] rounded-r-md"></div>
                <div className="pl-2">
                  <p className="text-xs text-gray-500 mb-1 font-bold">{nota.fecha}</p>
                  <p className="text-sm text-[#16333F] mb-3 leading-relaxed">{nota.texto}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Registrado por: {nota.autor}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <NoteIcon />
              <p className="text-sm text-gray-400 font-medium mt-3">No hay anotaciones registradas.</p>
            </div>
          )}
        </div>
      </Modal>

      {/* --- MODAL: Registrar Abuelito --- */}
      <Modal
        isOpen={modals.isRegistrarOpen}
        onClose={() => modals.setIsRegistrarOpen(false)}
        title="Registrar Abuelito"
      >
        {/* (El mismo formulario que ya tenías) */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#16333F] mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              onChange={(e) =>
                setFormRegistro({ ...formRegistro, nombre: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-[#F9F7F1] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16333F]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16333F] mb-1">
                DNI
              </label>
              <input
                type="text"
                onChange={(e) =>
                  setFormRegistro({ ...formRegistro, dni: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-[#F9F7F1] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16333F]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-[#16333F] mb-1">
                  Edad
                </label>
                <input
                  type="number"
                  onChange={(e) =>
                    setFormRegistro({ ...formRegistro, edad: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-[#F9F7F1] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16333F]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#16333F] mb-1">
                  G. Sangre
                </label>
                <select
                  onChange={(e) =>
                    setFormRegistro({
                      ...formRegistro,
                      grupoSanguineo: e.target.value,
                    })
                  }
                  className="w-full px-2 py-2.5 bg-[#F9F7F1] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16333F]"
                >
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="A-">A-</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#16333F] mb-1">
              Enfermedades
            </label>
            <input
              type="text"
              placeholder="Ej. Hipertensión"
              onChange={(e) =>
                setFormRegistro({
                  ...formRegistro,
                  enfermedades: e.target.value.split(","),
                })
              }
              className="w-full px-4 py-2.5 bg-[#F9F7F1] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16333F]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#16333F] mb-1">
              Medicamentos
            </label>
            <input
              type="text"
              placeholder="Ej. Losartán"
              onChange={(e) =>
                setFormRegistro({
                  ...formRegistro,
                  medicamentos: e.target.value.split(","),
                })
              }
              className="w-full px-4 py-2.5 bg-[#F9F7F1] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16333F]"
            />
          </div>
          <button
            onClick={() => handlers.handleRegistrar(formRegistro)}
            className="w-full bg-[#3D5665] hover:bg-[#16333F] text-white py-3 mt-4 rounded-xl font-bold transition-colors shadow-md"
          >
            Guardar Registro
          </button>
        </div>
      </Modal>

      {/* --- MODAL: Detalles del Perfil --- */}
      <Modal
        isOpen={modals.isDetallesOpen}
        onClose={() => modals.setIsDetallesOpen(false)}
        title={isEditing ? "Editar Perfil" : "Detalles del Perfil"}
      >
        {/* (El mismo modal de editar/ver detalles que ya tenías) */}
        {detalles.abuelitoSeleccionado && (
          <div className="space-y-5">
            {showDeleteConfirm ? (
              <div className="bg-red-50 border border-red-200 p-5 rounded-xl text-center space-y-4">
                <h4 className="text-red-700 font-bold text-lg">
                  ¿Eliminar perfil?
                </h4>
                <p className="text-sm text-red-600">
                  Esta acción no se puede deshacer. Se perderá el historial
                  asociado a {detalles.abuelitoSeleccionado.nombre}.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-white border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() =>
                      handlers.handleEliminar(detalles.abuelitoSeleccionado!.id)
                    }
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                  >
                    Sí, eliminar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Nombre Completo
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.nombre || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, nombre: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#F9F7F1] border border-gray-200 rounded-lg text-sm outline-none focus:border-[#16333F]"
                      />
                    ) : (
                      <p className="font-semibold text-[#16333F]">
                        {detalles.abuelitoSeleccionado.nombre}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                        DNI{" "}
                        <span className="font-normal text-xs">(Inmutable)</span>
                      </label>
                      <p className="font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-lg text-sm cursor-not-allowed">
                        {detalles.abuelitoSeleccionado.dni}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                          Edad
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.edad || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, edad: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-[#F9F7F1] border border-gray-200 rounded-lg text-sm outline-none focus:border-[#16333F]"
                          />
                        ) : (
                          <p className="font-semibold text-[#16333F]">
                            {detalles.abuelitoSeleccionado.edad} años
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                          G. Sangre
                        </label>
                        {isEditing ? (
                          <select
                            value={editForm.grupoSanguineo || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                grupoSanguineo: e.target.value,
                              })
                            }
                            className="w-full px-2 py-2 bg-[#F9F7F1] border border-gray-200 rounded-lg text-sm outline-none focus:border-[#16333F]"
                          >
                            <option value="O+">O+</option>
                            <option value="A+">A+</option>
                            <option value="B+">B+</option>
                            <option value="A-">A-</option>
                          </select>
                        ) : (
                          <p className="font-semibold text-[#16333F]">
                            {detalles.abuelitoSeleccionado.grupoSanguineo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Enfermedades
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.enfermedades?.join(", ") || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            enfermedades: e.target.value.split(", "),
                          })
                        }
                        className="w-full px-3 py-2 bg-[#F9F7F1] border border-gray-200 rounded-lg text-sm outline-none focus:border-[#16333F]"
                      />
                    ) : (
                      <p className="font-semibold text-[#16333F]">
                        {detalles.abuelitoSeleccionado.enfermedades?.join(
                          ", ",
                        ) || "Ninguna"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Medicamentos
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.medicamentos?.join(", ") || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            medicamentos: e.target.value.split(", "),
                          })
                        }
                        className="w-full px-3 py-2 bg-[#F9F7F1] border border-gray-200 rounded-lg text-sm outline-none focus:border-[#16333F]"
                      />
                    ) : (
                      <p className="font-semibold text-[#16333F]">
                        {detalles.abuelitoSeleccionado.medicamentos?.join(
                          ", ",
                        ) || "Ninguno"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-[#16333F] mb-4 uppercase tracking-wider">
                    <UsersIcon /> Equipo de Cuidado
                  </h4>

                  <div className="space-y-3">
                    {detalles.abuelitoSeleccionado.cuidadores.map(
                      (cuidador) => {
                        const isMe = cuidador.email === "maria@foll.com"; // Simulación de tu email
                        const iamPrincipal =
                          detalles.abuelitoSeleccionado!.rol === "Principal";

                        return (
                          <div
                            key={cuidador.id}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${cuidador.rol === "Principal" ? "bg-[#FDF5D3] text-[#DCA646]" : "bg-gray-200 text-gray-500"}`}
                              >
                                {cuidador.nombre.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#16333F]">
                                  {cuidador.nombre} {isMe && "(Tú)"}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {cuidador.rol}
                                </p>
                              </div>
                            </div>

                            {/* ACCIONES PARA EL PRINCIPAL */}
                            {iamPrincipal && !isMe && (
                              <div className="flex gap-1">
                                {cuidador.rol === "Invitado" ? (
                                  <button
                                    title="Compartir Mando Principal"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `¿Estás seguro de compartir el mando principal con ${cuidador.nombre}?`
                                        )
                                      ) {
                                        handlers.handleCompartirMando(
                                          detalles.abuelitoSeleccionado!.id,
                                          cuidador.id
                                        );
                                      }
                                    }}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    <ShieldCheckIcon />
                                  </button>
                                ) : (
                                  <button
                                    title="Quitar Mando Principal"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `¿Estás seguro de quitar el mando principal a ${cuidador.nombre}?`
                                        )
                                      ) {
                                        handlers.handleQuitarMando(
                                          detalles.abuelitoSeleccionado!.id,
                                          cuidador.id
                                        );
                                      }
                                    }}
                                    className="p-2 text-[#DCA646] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <ShieldXIcon />
                                  </button>
                                )}
                                <button
                                  title="Eliminar del Equipo"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `¿Eliminar a ${cuidador.nombre} del equipo de cuidado?`,
                                      )
                                    ) {
                                      handlers.handleEliminarCuidador(
                                        detalles.abuelitoSeleccionado!.id,
                                        cuidador.id,
                                      );
                                    }
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            )}

                            {/* Badge para el principal (si no soy yo) */}
                            {cuidador.rol === "Principal" && !iamPrincipal && (
                              <span className="text-[#DCA646]">
                                <ShieldCheckIcon />
                              </span>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-white border border-gray-300 text-gray-600 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() =>
                          handlers.handleActualizar(
                            detalles.abuelitoSeleccionado!.id,
                            editForm,
                          )
                        }
                        className="flex-1 bg-[#3D5665] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#16333F] transition-colors"
                      >
                        Guardar Cambios
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center justify-center gap-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 py-2.5 rounded-xl font-bold text-sm transition-colors"
                      >
                        <TrashIcon />
                      </button>
                      <button
                        onClick={handleIniciarEdicion}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#3D5665] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#16333F] transition-colors"
                      >
                        <EditIcon /> Editar Perfil
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
