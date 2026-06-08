import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './shared/components/layout/Layout';
import { GuestRoute, ProtectedRoute } from './shared/routing/ProtectedRoute';
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
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Inicio />} />
            <Route path="abuelitos" element={<MisAbuelitos />} />
            <Route path="historial" element={<Historial />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
