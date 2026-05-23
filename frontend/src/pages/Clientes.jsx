import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Alert, CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../services/api';

const tipoIdentificacionOptions = [
  { value: 'RUC', label: 'RUC' },
  { value: 'CEDULA', label: 'Cédula' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'CONSUMIDOR_FINAL', label: 'Consumidor Final' },
];

export default function Clientes() {
  const theme = useTheme();
  const [empresa, setEmpresa] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [formData, setFormData] = useState({
    identificacion: '', tipoIdentificacion: 'RUC', razonSocial: '',
    direccion: '', telefono: '', email: '',
  });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const empresaRes = await api.get('/empresa');
      if (empresaRes.data.length > 0) {
        const emp = empresaRes.data[0];
        setEmpresa(emp);
        const clientesRes = await api.get(`/cliente?empresaId=${emp.id}`);
        setClientes(clientesRes.data);
      }
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (cliente = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        identificacion: cliente.identificacion,
        tipoIdentificacion: cliente.tipoIdentificacion,
        razonSocial: cliente.razonSocial,
        direccion: cliente.direccion || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
      });
    } else {
      setEditingCliente(null);
      setFormData({ identificacion: '', tipoIdentificacion: 'RUC', razonSocial: '', direccion: '', telefono: '', email: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => { setDialogOpen(false); setEditingCliente(null); };

  const handleSubmit = async () => {
    if (!formData.identificacion || !formData.razonSocial) {
      setMessage({ type: 'error', text: 'Identificación y Razón Social son obligatorios' });
      return;
    }
    setLoading(true);
    try {
      const data = { ...formData, empresaId: empresa.id };
      if (editingCliente) {
        await api.patch(`/cliente/${editingCliente.id}`, data);
        setMessage({ type: 'success', text: 'Cliente actualizado' });
      } else {
        await api.post('/cliente', data);
        setMessage({ type: 'success', text: 'Cliente creado' });
      }
      handleCloseDialog();
      cargarDatos();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al guardar' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try {
      await api.delete(`/cliente/${id}`);
      setMessage({ type: 'success', text: 'Cliente eliminado' });
      cargarDatos();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            color: theme.palette.mode === 'dark' ? '#FAFAFA' : '#0F172A' 
          }}
        >
          Clientes
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Nuevo cliente
        </Button>
      </Box>

      {message && <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>{message.text}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0A0A0A' : '#F9FAFB' }}>
                <TableCell>Identificación</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Razón Social</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell align="center" width={100}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && clientes.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
              ) : clientes.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay clientes registrados</TableCell></TableRow>
              ) : (
                clientes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.identificacion}</TableCell>
                    <TableCell>{c.tipoIdentificacion}</TableCell>
                    <TableCell>{c.razonSocial}</TableCell>
                    <TableCell>{c.email || '-'}</TableCell>
                    <TableCell>{c.telefono || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpenDialog(c)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField select fullWidth label="Tipo de Identificación" value={formData.tipoIdentificacion} onChange={(e) => setFormData({ ...formData, tipoIdentificacion: e.target.value })}>
              {tipoIdentificacionOptions.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Identificación" value={formData.identificacion} onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })} placeholder="RUC o Cédula" />
            <TextField fullWidth label="Razón Social / Nombres" value={formData.razonSocial} onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })} />
            <TextField fullWidth label="Dirección" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} />
            <TextField fullWidth label="Teléfono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
            <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}