import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Alert, CircularProgress, Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../services/api';

const ivaOptions = [
  { value: '2', label: 'IVA 15%' },
  { value: '0', label: 'IVA 0%' },
  { value: '6', label: 'No objeto de IVA' },
];

export default function Productos() {
  const theme = useTheme();
  const [empresa, setEmpresa] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '', nombre: '', descripcion: '', precioUnitario: '', codigoIva: '2',
  });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const empresaRes = await api.get('/empresa');
      if (empresaRes.data.length > 0) {
        const emp = empresaRes.data[0];
        setEmpresa(emp);
        const productosRes = await api.get(`/producto?empresaId=${emp.id}`);
        setProductos(productosRes.data);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (producto = null) => {
    if (producto) {
      setEditingProducto(producto);
      setFormData({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precioUnitario: producto.precioUnitario,
        codigoIva: producto.codigoIva,
      });
    } else {
      setEditingProducto(null);
      setFormData({ codigo: '', nombre: '', descripcion: '', precioUnitario: '', codigoIva: '2' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => { setDialogOpen(false); setEditingProducto(null); };

  const handleSubmit = async () => {
    if (!formData.codigo || !formData.nombre || !formData.precioUnitario) {
      setMessage({ type: 'error', text: 'Código, Nombre y Precio son obligatorios' });
      return;
    }
    setLoading(true);
    try {
      const data = { ...formData, precioUnitario: Number(formData.precioUnitario), empresaId: empresa.id };
      if (editingProducto) {
        await api.patch(`/producto/${editingProducto.id}`, data);
        setMessage({ type: 'success', text: 'Producto actualizado' });
      } else {
        await api.post('/producto', data);
        setMessage({ type: 'success', text: 'Producto creado' });
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
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/producto/${id}`);
      setMessage({ type: 'success', text: 'Producto eliminado' });
      cargarDatos();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar' });
    }
  };

  const getIvaLabel = (codigo) => ivaOptions.find(o => o.value === codigo)?.label || codigo;

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
          Productos
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Nuevo producto
        </Button>
      </Box>

      {message && <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>{message.text}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0A0A0A' : '#F9FAFB' }}>
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Precio Unit.</TableCell>
                <TableCell>IVA</TableCell>
                <TableCell align="center" width={100}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && productos.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
              ) : productos.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay productos registrados</TableCell></TableRow>
              ) : (
                productos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.codigo}</TableCell>
                    <TableCell>
                      {p.nombre}
                      {p.descripcion && <Typography variant="caption" display="block" color="text.secondary">{p.descripcion}</Typography>}
                    </TableCell>
                    <TableCell>${Number(p.precioUnitario).toFixed(2)}</TableCell>
                    <TableCell><Chip label={getIvaLabel(p.codigoIva)} size="small" variant="outlined" /></TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpenDialog(p)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="Código" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} placeholder="PROD001" />
            <TextField fullWidth label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
            <TextField fullWidth label="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} multiline rows={2} />
            <TextField fullWidth label="Precio Unitario" type="number" value={formData.precioUnitario} onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })} inputProps={{ min: 0, step: 0.01 }} />
            <TextField select fullWidth label="Tipo de IVA" value={formData.codigoIva} onChange={(e) => setFormData({ ...formData, codigoIva: e.target.value })}>
              {ivaOptions.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </TextField>
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