import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

import { AppShell } from '@/components/AppShell'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AuthProvider } from '@/lib/auth'
import { ComunicadosPage } from '@/pages/ComunicadosPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { PagosPage } from '@/pages/PagosPage'
import { PaquetesPage } from '@/pages/PaquetesPage'
import { PQRPage } from '@/pages/PQRPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ReservasPage } from '@/pages/ReservasPage'
import { VisitasPage } from '@/pages/VisitasPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/pagos" element={<PagosPage />} />
              <Route path="/visitas" element={<VisitasPage />} />
              <Route path="/paquetes" element={<PaquetesPage />} />
              <Route path="/reservas" element={<ReservasPage />} />
              <Route path="/comunicados" element={<ComunicadosPage />} />
              <Route path="/pqr" element={<PQRPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
