import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Dialog, DialogContent, Box, Typography, Chip } from '@mui/material';
import {
  Search, Add, Receipt, People, Inventory, Settings,
  Dashboard, History,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from "../../services/api";

function CommandPalette({ open, onClose }) {
  const [search, setSearch] = useState('');
  const [clientes, setClientes] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      cargarDatos();
    }
  }, [open]);

  const cargarDatos = async () => {
    try {
      const empresaRes = await api.get('/empresa');
      if (empresaRes.data.length > 0) {
        const emp = empresaRes.data[0];
        setEmpresa(emp);
        const clientesRes = await api.get(`/cliente?empresaId=${emp.id}`);
        setClientes(clientesRes.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error cargando datos para command palette:', error);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleNavegarFacturacionConCliente = (cliente) => {
    navigate('/facturacion', { state: { clientePreseleccionado: cliente } });
    onClose();
  };

  return (
    <Command label="Command Menu" shouldFilter={false}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5,
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
        <Command.Input
          value={search}
          onValueChange={setSearch}
          placeholder="Buscar o crear..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '1rem',
            background: 'transparent',
            color: 'inherit',
          }}
        />
        <Chip label="ESC" size="small" variant="outlined" />
      </Box>
      
      <Command.List style={{ padding: '8px', maxHeight: '400px', overflowY: 'auto' }}>
        <Command.Empty>No se encontraron resultados.</Command.Empty>
        
        <Command.Group heading="Acciones">
          <Command.Item onSelect={() => handleNavigate('/facturacion')}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Add fontSize="small" />
              <span>Nueva factura</span>
              <Chip label="⌘N" size="small" sx={{ ml: 'auto' }} />
            </Box>
          </Command.Item>
          <Command.Item onSelect={() => handleNavigate('/historial')}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <History fontSize="small" />
              <span>Ver historial</span>
            </Box>
          </Command.Item>
          <Command.Item onSelect={() => handleNavigate('/clientes')}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <People fontSize="small" />
              <span>Nuevo cliente</span>
            </Box>
          </Command.Item>
          <Command.Item onSelect={() => handleNavigate('/productos')}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Inventory fontSize="small" />
              <span>Nuevo producto</span>
            </Box>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Navegación">
          <Command.Item onSelect={() => handleNavigate('/')}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Dashboard fontSize="small" />
              <span>Dashboard</span>
            </Box>
          </Command.Item>
          <Command.Item onSelect={() => handleNavigate('/facturacion')}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Receipt fontSize="small" />
              <span>Ventas</span>
            </Box>
          </Command.Item>
          <Command.Item onSelect={() => handleNavigate('/clientes')}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <People fontSize="small" />
              <span>Contactos</span>
            </Box>
          </Command.Item>
          <Command.Item onSelect={() => handleNavigate('/empresa')}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Settings fontSize="small" />
              <span>Ajustes</span>
            </Box>
          </Command.Item>
        </Command.Group>

        {clientes.length > 0 && (
          <Command.Group heading="Buscar clientes">
            {clientes.map((c) => (
              <Command.Item key={c.id} onSelect={() => handleNavegarFacturacionConCliente(c)}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <People fontSize="small" />
                  <Box>
                    <Typography variant="body2">{c.razonSocial}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.identificacion}</Typography>
                  </Box>
                </Box>
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command>
  );
}

export default CommandPalette;