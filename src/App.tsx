import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './shared/components/layout/Layout';
import { GuestRoute, ProtectedRoute } from './shared/routing/ProtectedRoute';
import Login from './domains/iam/views/Login';
import Register from './domains/iam/views/Register';
import Inicio from './domains/emergencias/views/Inicio';
import MisAbuelitos from './domains/iam/views/MisAbuelitos';
import Historial from './domains/emergencias/views/Historial';
import Reportes from './domains/emergencias/views/Reportes';
import Invitaciones from './domains/invitations/views/Invitaciones';
import Perfil from './domains/iam/views/Perfil';
import Ayuda from './domains/support/views/Ayuda';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Inicio />} />
            <Route path="abuelitos" element={<MisAbuelitos />} />
            <Route path="historial" element={<Historial />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="invitaciones" element={<Invitaciones />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="ayuda" element={<Ayuda />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
