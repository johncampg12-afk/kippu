import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme/kipuTheme';
import AppShell from './layouts/AppShell';
import Dashboard from './pages/Dashboard';
import Facturacion from './pages/Facturacion';
import HistorialFacturas from './pages/HistorialFacturas';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import ConfiguracionEmpresa from './pages/ConfiguracionEmpresa';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const theme = useMemo(() => {
    return isDarkMode ? darkTheme : lightTheme;
  }, [isDarkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppShell onToggleTheme={() => setIsDarkMode(!isDarkMode)} isDarkMode={isDarkMode}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/facturacion" element={<Facturacion />} />
              <Route path="/historial" element={<HistorialFacturas />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/empresa" element={<ConfiguracionEmpresa />} />
            </Routes>
          </AppShell>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;