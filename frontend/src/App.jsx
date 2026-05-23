import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { lightTheme, darkTheme } from './theme/kipuTheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AppShell from './layouts/AppShell';

// Páginas públicas
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Páginas protegidas
import Dashboard from './pages/Dashboard';
import Facturacion from './pages/Facturacion';
import HistorialFacturas from './pages/HistorialFacturas';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import ConfiguracionEmpresa from './pages/ConfiguracionEmpresa';

const queryClient = new QueryClient();

// Componente para rutas protegidas
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Componente para rutas públicas (redirige al dashboard si ya está autenticado)
function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

// Layout interno para rutas protegidas (con sidebar)
function ProtectedLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = useMemo(() => isDarkMode ? darkTheme : lightTheme, [isDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell onToggleTheme={() => setIsDarkMode(!isDarkMode)} isDarkMode={isDarkMode}>
        <Outlet />
      </AppShell>
    </ThemeProvider>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = useMemo(() => isDarkMode ? darkTheme : lightTheme, [isDarkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Rutas públicas (sin sidebar) */}
              <Route element={<PublicRoute />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Rutas protegidas (con sidebar) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<ProtectedLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/facturacion" element={<Facturacion />} />
                  <Route path="/historial" element={<HistorialFacturas />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/productos" element={<Productos />} />
                  <Route path="/empresa" element={<ConfiguracionEmpresa />} />
                </Route>
              </Route>

              {/* Redirección por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;