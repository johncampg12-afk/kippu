import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, Skeleton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StatCard = ({ label, value, format, loading }) => (
  <Paper sx={{ p: 3, height: '100%' }}>
    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{label}</Typography>
    {loading ? (
      <Skeleton variant="text" width={100} height={40} />
    ) : (
      <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {format === 'currency' ? `$${value.toFixed(2)}` : value}
      </Typography>
    )}
  </Paper>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [empresa, setEmpresa] = useState(null);
  const [stats, setStats] = useState({ facturasMes: 0, totalMes: 0, porCobrar: 0, vencenHoy: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const empresaRes = await api.get('/empresa');
      if (empresaRes.data.length > 0) {
        const emp = empresaRes.data[0];
        setEmpresa(emp);
        const statsRes = await api.get(`/factura/estadisticas/${emp.id}`);
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
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
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
          <Tooltip title="Nueva factura · ⌘N">
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/facturacion')}>
              Nueva factura
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Facturas este mes" value={stats.facturasMes} loading={loading} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total facturado (mes)" value={stats.totalMes} format="currency" loading={loading} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Por cobrar" value={stats.porCobrar} format="currency" loading={loading} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Vencen hoy" value={stats.vencenHoy} loading={loading} /></Grid>
      </Grid>

      {empresa && (
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>Información del Emisor</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Razón Social</Typography><Typography variant="body1" color="text.primary">{empresa.razonSocial}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">RUC</Typography><Typography variant="body1" color="text.primary">{empresa.ruc}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Establecimiento / Punto Emisión</Typography><Typography variant="body1" color="text.primary">{empresa.codigoEstablecimiento} - {empresa.codigoPuntoEmision}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Obligado a llevar contabilidad</Typography><Typography variant="body1" color="text.primary">{empresa.obligadoContabilidad ? 'SÍ' : 'NO'}</Typography></Grid>
            </Grid>
          </Paper>
        </Box>
      )}
    </Box>
  );
}