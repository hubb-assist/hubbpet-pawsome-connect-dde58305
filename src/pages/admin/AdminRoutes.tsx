
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AprovacaoVeterinariosPage from './AprovacaoVeterinariosPage';
import MediacaoConflitosPage from './MediacaoConflitosPage';
import ConfiguracoesComissaoPage from './ConfiguracoesComissaoPage';
import ProcedimentosPage from './ProcedimentosPage';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/veterinarios" element={<AprovacaoVeterinariosPage />} />
      <Route path="/conflitos" element={<MediacaoConflitosPage />} />
      <Route path="/comissoes" element={<ConfiguracoesComissaoPage />} />
      <Route path="/procedimentos" element={<ProcedimentosPage />} />
    </Routes>
  );
};

export default AdminRoutes;
