
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AprovacaoVeterinariosPage from './AprovacaoVeterinariosPage';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<AdminDashboard />} />
      <Route path="veterinarios" element={<AprovacaoVeterinariosPage />} />
      {/* Outras rotas admin serão adicionadas aqui */}
    </Routes>
  );
};

export default AdminRoutes;
