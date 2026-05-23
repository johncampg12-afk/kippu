import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, TextField, MenuItem, Grid,
  Button, Skeleton, InputAdornment, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Pagination, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Search, Download, Visibility, PictureAsPdf, Code,
  Refresh, FilterList, Clear, ViewCompact, ViewComfy,
} from '@mui/icons-material';
import api from '../services/api';

const estadoOptions = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'FIRMADA', label: 'Firmada' },
  { value: 'ENVIADA', label: 'Enviada' },
  { value: 'AUTORIZADA', label: 'Autorizada' },
  { value: 'RECHAZADA', label: 'Rechazada' },
];

const estadoColors = {
  PENDIENTE: 'warning',
  FIRMADA: 'info',
  ENVIADA: 'warning',
  AUTORIZADA: 'success',
  RECHAZADA: 'error',
  ANULADA: 'error',
};

export default function HistorialFacturas() {
  const theme = useTheme();
  const [empresa, setEmpresa] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaInicio: '', fechaFin: '', cliente: '', estado: 'TODOS',
  });
  const [page, setPage] = useState(1);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [density, setDensity] = useState('comfortable');
  const rowsPerPage = 10;

  useEffect(() => { cargarEmpresa(); }, []);
  useEffect(() => { if (empresa) cargarFacturas(); }, [empresa]);

  const cargarEmpresa = async () => {
    try {
      const res = await api.get('/empresa');
      if (res.data.length > 0) setEmpresa(res.data[0]);
    } catch (error) {
      console.error('Error cargando empresa:', error);
    }
  };

  const cargarFacturas = async () => {
    if (!empresa) return;
    setLoading(true);
    try {
      const params = { empresaId: empresa.id };
      if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
      if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
      if (filtros.cliente) params.cliente = filtros.cliente;
      if (filtros.estado !== 'TODOS') params.estado = filtros.estado;
      const res = await api.get('/factura', { params });
      setFacturas(res.data);
      setPage(1);
    } catch (error) {
      console.error('Error cargando facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    if (!empresa) return;
    setExporting(true);
    try {
      const params = {};
      if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
      if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
      const response = await api.get(`/factura/exportar/${empresa.id}`, { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facturas_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exportando:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleDescargarPDF = (id) => window.open(`http://localhost:3000/sri/descargar-ride/${id}`, '_blank');
  const handleDescargarXML = (id) => window.open(`http://localhost:3000/sri/descargar-xml/${id}`, '_blank');

  const facturasPaginadas = facturas.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalFacturado = facturas.reduce((sum, f) => sum + Number(f.total), 0);

  const tableCellSx = density === 'compact' 
    ? { py: 0.5, fontSize: '0.75rem' } 
    : { py: 1.5, fontSize: '0.875rem' };

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
          Historial de Facturas
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Exportar a Excel">
            <Button variant="outlined" startIcon={<Download />} onClick={handleExportar} disabled={exporting || facturas.length === 0}>
              Exportar
            </Button>
          </Tooltip>
          <Tooltip title="Actualizar">
            <IconButton onClick={cargarFacturas}><Refresh /></IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}><TextField fullWidth type="date" label="Desde" value={filtros.fechaInicio} onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})} InputLabelProps={{shrink: true}} size="small" /></Grid>
          <Grid item xs={12} sm={2}><TextField fullWidth type="date" label="Hasta" value={filtros.fechaFin} onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})} InputLabelProps={{shrink: true}} size="small" /></Grid>
          <Grid item xs={12} sm={3}><TextField fullWidth label="Cliente" value={filtros.cliente} onChange={(e) => setFiltros({...filtros, cliente: e.target.value})} size="small" InputProps={{startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>}} /></Grid>
          <Grid item xs={12} sm={2}><TextField select fullWidth label="Estado" value={filtros.estado} onChange={(e) => setFiltros({...filtros, estado: e.target.value})} size="small">{estadoOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} sm={3}><Box sx={{display: 'flex', gap: 1}}><Button variant="contained" startIcon={<FilterList />} onClick={cargarFacturas}>Filtrar</Button><Button variant="outlined" startIcon={<Clear />} onClick={() => setFiltros({fechaInicio:'', fechaFin:'', cliente:'', estado:'TODOS'})}>Limpiar</Button></Box></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Cargando...' : `${facturas.length} facturas · Total: `}<strong>${totalFacturado.toFixed(2)}</strong>
          </Typography>
          <ToggleButtonGroup size="small" value={density} exclusive onChange={(_, v) => v && setDensity(v)}>
            <ToggleButton value="compact"><ViewCompact fontSize="small" /></ToggleButton>
            <ToggleButton value="comfortable"><ViewComfy fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <TableContainer>
          <Table size={density === 'compact' ? 'small' : 'medium'}>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0A0A0A' : '#F9FAFB' }}>
                <TableCell sx={tableCellSx}>Nº Comprobante</TableCell>
                <TableCell sx={tableCellSx}>Fecha</TableCell>
                <TableCell sx={tableCellSx}>Cliente</TableCell>
                <TableCell align="right" sx={tableCellSx}>Subtotal</TableCell>
                <TableCell align="right" sx={tableCellSx}>IVA</TableCell>
                <TableCell align="right" sx={tableCellSx}>Total</TableCell>
                <TableCell sx={tableCellSx}>Estado</TableCell>
                <TableCell align="center" width={150} sx={tableCellSx}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8} sx={{ p: 1 }}><Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} /></TableCell>
                  </TableRow>
                ))
              ) : facturasPaginadas.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>Sin facturas · Crear primera (N)</TableCell></TableRow>
              ) : (
                facturasPaginadas.map(f => (
                  <TableRow key={f.id} hover>
                    <TableCell sx={{ ...tableCellSx, fontFamily: 'monospace' }}>{f.numeroComprobante}</TableCell>
                    <TableCell sx={tableCellSx}>{new Date(f.fechaEmision).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell sx={tableCellSx}>{f.razonSocialComprador}<Typography variant="caption" display="block" color="text.secondary">{f.identificacionComprador}</Typography></TableCell>
                    <TableCell align="right" sx={tableCellSx}>${Number(f.subtotal).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={tableCellSx}>${Number(f.iva12).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ ...tableCellSx, fontWeight: 600 }}>${Number(f.total).toFixed(2)}</TableCell>
                    <TableCell sx={tableCellSx}><Chip label={f.estado} size="small" color={estadoColors[f.estado] || 'default'} /></TableCell>
                    <TableCell align="center" sx={tableCellSx}>
                      <Tooltip title="Ver detalles"><IconButton size="small" onClick={() => { setSelectedFactura(f); setDialogOpen(true); }}><Visibility fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="PDF"><IconButton size="small" onClick={() => handleDescargarPDF(f.id)}><PictureAsPdf fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="XML"><IconButton size="small" onClick={() => handleDescargarXML(f.id)}><Code fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {facturas.length > rowsPerPage && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination count={Math.ceil(facturas.length / rowsPerPage)} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </Box>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalle de Factura</DialogTitle>
        <DialogContent dividers>
          {selectedFactura && (
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Nº Comprobante</Typography><Typography variant="body1" color="text.primary" sx={{fontFamily:'monospace'}}>{selectedFactura.numeroComprobante}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Clave de Acceso</Typography><Typography variant="body2" color="text.primary" sx={{fontFamily:'monospace', fontSize:'0.7rem'}}>{selectedFactura.claveAcceso}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Fecha Emisión</Typography><Typography variant="body1" color="text.primary">{new Date(selectedFactura.fechaEmision).toLocaleDateString('es-ES')}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Estado</Typography><Chip label={selectedFactura.estado} size="small" color={estadoColors[selectedFactura.estado] || 'default'} /></Grid>
              <Grid item xs={12}><Typography variant="body2" color="text.secondary">Cliente</Typography><Typography variant="body1" color="text.primary">{selectedFactura.razonSocialComprador}</Typography><Typography variant="caption" color="text.secondary">{selectedFactura.identificacionComprador}</Typography></Grid>
              {selectedFactura.numeroAutorizacion && <Grid item xs={12}><Typography variant="body2" color="text.secondary">Nº Autorización SRI</Typography><Typography variant="body1" color="text.primary" sx={{fontFamily:'monospace'}}>{selectedFactura.numeroAutorizacion}</Typography></Grid>}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
          {selectedFactura && <><Button startIcon={<PictureAsPdf />} onClick={() => handleDescargarPDF(selectedFactura.id)}>PDF</Button><Button startIcon={<Code />} onClick={() => handleDescargarXML(selectedFactura.id)}>XML</Button></>}
        </DialogActions>
      </Dialog>
    </Box>
  );
}