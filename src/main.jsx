import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Layout from './Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import GenericSurat from './pages/GenericSurat'
import Klasifikasi from './pages/Klasifikasi'
import TemplateSurat from './pages/TemplateSurat'
import Pengaturan from './pages/Pengaturan'
import './index.css'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/surat-keluar" element={<ProtectedRoute><GenericSurat type="surat_keluar" title="Surat Keluar" /></ProtectedRoute>} />
          <Route path="/surat-masuk" element={<ProtectedRoute><GenericSurat type="surat_masuk" title="Surat Masuk" /></ProtectedRoute>} />
          <Route path="/surat-tugas" element={<ProtectedRoute><GenericSurat type="surat_tugas" title="Surat Tugas" /></ProtectedRoute>} />
          <Route path="/surat-keputusan" element={<ProtectedRoute><GenericSurat type="surat_keputusan" title="Surat Keputusan" /></ProtectedRoute>} />
          <Route path="/surat-internal" element={<ProtectedRoute><GenericSurat type="surat_internal" title="Surat Internal" /></ProtectedRoute>} />
          <Route path="/klasifikasi" element={<ProtectedRoute><Klasifikasi /></ProtectedRoute>} />
          <Route path="/template" element={<ProtectedRoute><TemplateSurat /></ProtectedRoute>} />
          <Route path="/pengaturan" element={<ProtectedRoute><Pengaturan /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)