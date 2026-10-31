import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SiteProvider } from './lib/SiteContext'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Stock from './pages/Stock'
import VehicleDetail from './pages/VehicleDetail'
import NotFound from './pages/NotFound'

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminVehicles = lazy(() => import('./pages/admin/AdminVehicles'))
const AdminVehicleForm = lazy(() => import('./pages/admin/AdminVehicleForm'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminGoogle = lazy(() => import('./pages/admin/AdminGoogle'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminFeatured = lazy(() => import('./pages/admin/AdminFeatured'))
const AdminHome = lazy(() => import('./pages/admin/AdminHome'))

export default function App() {
  return (
    <SiteProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="admin-loading">Carregando…</div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="estoque" element={<Stock />} />
              <Route path="moto/:slug" element={<VehicleDetail />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="veiculos" element={<AdminVehicles />} />
              <Route path="veiculos/novo" element={<AdminVehicleForm key="novo" />} />
              <Route path="veiculos/:id" element={<AdminVehicleForm />} />
              <Route path="destaques" element={<AdminFeatured />} />
              <Route path="pagina-inicial" element={<AdminHome />} />
              <Route path="categorias" element={<AdminCategories />} />
              <Route path="loja" element={<AdminSettings />} />
              <Route path="google" element={<AdminGoogle />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </SiteProvider>
  )
}
