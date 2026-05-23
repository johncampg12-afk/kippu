import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Grid,
  Box, Alert, CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import api from '../services/api';

function ConfiguracionEmpresa() {
  const theme = useTheme();
  const [empresa, setEmpresa] = useState(null);
  const [formData, setFormData] = useState({
    ruc: '', razonSocial: '', nombreComercial: '', direccionMatriz: '',
    codigoEstablecimiento: '001', codigoPuntoEmision: '001',
    obligadoContabilidad: true, telefono: '', email: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => { cargarEmpresa(); }, []);

  const cargarEmpresa = async () => {
    try {
      const response = await api.get('/empresa');
      if (response.data.length > 0) {
        const emp = response.data[0];
        setEmpresa(emp);
        setFormData({
          ruc: emp.ruc, razonSocial: emp.razonSocial, nombreComercial: emp.nombreComercial,
          direccionMatriz: emp.direccionMatriz, codigoEstablecimiento: emp.codigoEstablecimiento,
          codigoPuntoEmision: emp.codigoPuntoEmision, obligadoContabilidad: emp.obligadoContabilidad,
          telefono: emp.telefono || '', email: emp.email || '',
        });
      }
    } catch (error) {
      console.error('Error cargando empresa:', error);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (empresa) {
        await api.patch(`/empresa/${empresa.id}`, formData);
        setMessage({ type: 'success', text: 'Empresa actualizada exitosamente' });
      } else {
        const response = await api.post('/empresa', formData);
        setEmpresa(response.data);
        setMessage({ type: 'success', text: 'Empresa creada exitosamente' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al guardar la empresa' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 600, 
          mb: 3,
          color: theme.palette.mode === 'dark' ? '#FAFAFA' : '#0F172A' 
        }}
      >
        Mi Empresa
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Datos del emisor para facturación electrónica
        </Typography>

        {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="RUC" name="ruc" value={formData.ruc} onChange={handleChange} required inputProps={{ maxLength: 13 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Razón Social" name="razonSocial" value={formData.razonSocial} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Nombre Comercial" name="nombreComercial" value={formData.nombreComercial} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Dirección Matriz" name="direccionMatriz" value={formData.direccionMatriz} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Código Establecimiento" name="codigoEstablecimiento" value={formData.codigoEstablecimiento} onChange={handleChange} required inputProps={{ maxLength: 3 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Código Punto Emisión" name="codigoPuntoEmision" value={formData.codigoPuntoEmision} onChange={handleChange} required inputProps={{ maxLength: 3 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                {loading ? <CircularProgress size={24} /> : (empresa ? 'Actualizar Empresa' : 'Crear Empresa')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default ConfiguracionEmpresa;