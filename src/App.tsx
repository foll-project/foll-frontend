import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './shared/components/layout/Layout';
import Login from './domains/iam/views/Login';
import Register from './domains/iam/views/Register';
import Inicio from './domains/emergencias/views/Inicio';
import MisAbuelitos from './domains/iam/views/MisAbuelitos';
import Historial from './domains/emergencias/views/Historial';
import Perfil from './domains/iam/views/Perfil';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas Privadas (Con Layout) */}
        <Route path="/" element={<Layout />}>
          {/* EL CAMBIO ESTÁ AQUÍ: Inicio ahora es el hijo directo (index) del Layout */}
          <Route index element={<Inicio />} />
          
          {/* Las demás rutas que irán dentro del Layout */}
          <Route path="abuelitos" element={<MisAbuelitos />} />
          <Route path="historial" element={<Historial />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}