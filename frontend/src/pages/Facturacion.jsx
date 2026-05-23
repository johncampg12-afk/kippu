import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Button, Grid, Paper, IconButton, Autocomplete,
  Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputAdornment, CircularProgress, Divider, Tooltip, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Search, Delete, Add, CheckCircle, Edit } from '@mui/icons-material';
import { useHotkeys } from 'react-hotkeys-hook';
import api from '../services/api';

function Facturacion() {
  const theme = useTheme();
  const [empresa, setEmpresa] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [factura, setFactura] = useState({
    clienteId: '', fechaEmision: new Date().toISOString().split('T')[0], detalles: [],
  });
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [consultandoRuc, setConsultandoRuc] = useState(false);
  const [modalCompletarAbierto, setModalCompletarAbierto] = useState(false);
  const [clientePendiente, setClientePendiente] = useState(null);
  const [datosCompletar, setDatosCompletar] = useState({
    razonSocial: '', direccion: '', email: '', telefono: '',
  });

  const clienteInputRef = useRef(null);
  const productoInputRef = useRef(null);
  const cantidadInputRef = useRef(null);
  const debounceTimeout = useRef(null);

  useHotkeys('ctrl+b', (e) => { e.preventDefault(); clienteInputRef.current?.focus(); });
  useHotkeys('ctrl+p', (e) => { e.preventDefault(); productoInputRef.current?.focus(); });
  useHotkeys('ctrl+enter', (e) => {
    e.preventDefault();
    if (factura.detalles.length > 0 && clienteSeleccionado) handleGuardarFactura();
  });

  useEffect(() => { cargarDatosIniciales(); }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [empresaRes, clientesRes, productosRes] = await Promise.all([
        api.get('/empresa'), api.get('/cliente'), api.get('/producto'),
      ]);
      if (empresaRes.data.length > 0) setEmpresa(empresaRes.data[0]);
      setClientes(clientesRes.data);
      setProductos(productosRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const guardarDatosRuc = async (ruc, datos) => {
    try {
      await api.post('/sri/guardar-datos-ruc', {
        ruc,
        razonSocial: datos.razonSocial,
        direccion: datos.direccion || '',
        email: datos.email || '',
        telefono: datos.telefono || '',
      });
    } catch (error) {
      console.error('Error guardando datos RUC:', error);
    }
  };

  const consultarRuc = async (ruc) => {
    if (!ruc || ruc.length !== 13 || !/^\d+$/.test(ruc)) return;
    
    setConsultandoRuc(true);
    try {
      const response = await api.get(`/sri/consultar-ruc/${ruc}`);
      const data = response.data;
      
      if (data.validado) {
        if (data.requiereCompletar) {
          setMessage({ type: 'info', text: `RUC ${ruc} validado. Completa los datos del cliente.` });
          
          setClientePendiente({
            identificacion: ruc,
            tipoIdentificacion: data.tipoContribuyente === 'PERSONA NATURAL' ? 'CEDULA' : 'RUC',
            razonSocial: '',
            direccion: '',
          });
          setDatosCompletar({ razonSocial: '', direccion: '', email: '', telefono: '' });
          setModalCompletarAbierto(true);
        } else if (data.razonSocial) {
          const clienteExistente = clientes.find(c => c.identificacion === ruc);
          if (clienteExistente) {
            setClienteSeleccionado(clienteExistente);
            setBusquedaCliente(`${ruc} - ${clienteExistente.razonSocial}`);
            setMessage({ type: 'success', text: `✅ Cliente encontrado: ${clienteExistente.razonSocial}` });
          } else {
            try {
              const res = await api.post('/cliente', {
                identificacion: ruc,
                tipoIdentificacion: data.tipoContribuyente === 'PERSONA NATURAL' ? 'CEDULA' : 'RUC',
                razonSocial: data.razonSocial,
                direccion: data.direccion || '',
                email: '',
                telefono: '',
                empresaId: empresa?.id,
              });
              setClientes([...clientes, res.data]);
              setClienteSeleccionado(res.data);
              setBusquedaCliente(`${ruc} - ${data.razonSocial}`);
              setMessage({ type: 'success', text: `✅ Cliente creado: ${data.razonSocial}` });
            } catch (error) {
              console.error('Error creando cliente:', error);
              setMessage({ type: 'error', text: 'Error al crear el cliente' });
            }
          }
        }
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setMessage({ type: 'error', text: '❌ RUC inválido. Verifica el número.' });
      } else {
        setMessage({ type: 'error', text: 'Error al validar RUC' });
      }
    } finally {
      setConsultandoRuc(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleCompletarCliente = async () => {
    if (!datosCompletar.razonSocial.trim()) {
      setMessage({ type: 'error', text: 'La Razón Social es obligatoria' });
      return;
    }

    try {
      // Guardar en caché SRI
      await guardarDatosRuc(clientePendiente.identificacion, datosCompletar);

      // Crear cliente en BD
      const res = await api.post('/cliente', {
        identificacion: clientePendiente.identificacion,
        tipoIdentificacion: clientePendiente.tipoIdentificacion,
        razonSocial: datosCompletar.razonSocial,
        direccion: datosCompletar.direccion,
        email: datosCompletar.email,
        telefono: datosCompletar.telefono,
        empresaId: empresa?.id,
      });

      setClientes([...clientes, res.data]);
      setClienteSeleccionado(res.data);
      setBusquedaCliente(`${clientePendiente.identificacion} - ${datosCompletar.razonSocial}`);
      setModalCompletarAbierto(false);
      setMessage({ type: 'success', text: `✅ Cliente creado: ${datosCompletar.razonSocial}` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al crear el cliente' });
    }
  };

  const handleAgregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) return;
    const precio = Number(productoSeleccionado.precioUnitario);
    const cant = Number(cantidad);
    const subtotal = cant * precio;
    const valorIva = productoSeleccionado.codigoIva === '2' ? subtotal * 0.15 : 0;

    setFactura({
      ...factura,
      detalles: [...factura.detalles, {
        productoId: productoSeleccionado.id,
        codigoProducto: productoSeleccionado.codigo,
        nombreProducto: productoSeleccionado.nombre,
        cantidad: cant, precioUnitario: precio, descuento: 0,
        subtotal, codigoIva: productoSeleccionado.codigoIva, valorIva,
      }],
    });
    setProductoSeleccionado(null);
    setCantidad(1);
    setTimeout(() => productoInputRef.current?.focus(), 50);
  };

  const handleEliminarProducto = (index) => {
    setFactura({ ...factura, detalles: factura.detalles.filter((_, i) => i !== index) });
  };

  const calcularTotales = () => {
    const subtotal15 = factura.detalles.filter(d => d.codigoIva === '2').reduce((s, d) => s + d.subtotal, 0);
    const subtotal0 = factura.detalles.filter(d => d.codigoIva === '0').reduce((s, d) => s + d.subtotal, 0);
    const iva15 = factura.detalles.filter(d => d.codigoIva === '2').reduce((s, d) => s + d.valorIva, 0);
    return { subtotal15, subtotal0, iva15, total: subtotal15 + subtotal0 + iva15 };
  };

  const handleGuardarFactura = async () => {
    if (!clienteSeleccionado) { setMessage({ type: 'error', text: 'Selecciona un cliente' }); return; }
    if (factura.detalles.length === 0) { setMessage({ type: 'error', text: 'Agrega al menos un producto' }); return; }
    setLoading(true);
    try {
      const { subtotal15, subtotal0, iva15, total } = calcularTotales();
      await api.post('/factura', {
        empresaId: empresa.id, clienteId: clienteSeleccionado.id, fechaEmision: factura.fechaEmision,
        razonSocialComprador: clienteSeleccionado.razonSocial,
        identificacionComprador: clienteSeleccionado.identificacion,
        tipoIdentificacionComprador: clienteSeleccionado.tipoIdentificacion,
        direccionComprador: clienteSeleccionado.direccion || '',
        subtotal12: subtotal15, subtotal0, subtotalNoIva: 0, subtotal: subtotal15 + subtotal0,
        totalDescuento: 0, iva12: iva15, ice: 0, total, detalles: factura.detalles,
        ambiente: '01', tipoEmision: '1',
      });
      setMessage({ type: 'success', text: '✅ Factura creada exitosamente' });
      setFactura({ clienteId: '', fechaEmision: new Date().toISOString().split('T')[0], detalles: [] });
      setClienteSeleccionado(null); 
      setBusquedaCliente('');
      setTimeout(() => clienteInputRef.current?.focus(), 100);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || '❌ Error al crear la factura' });
    } finally { 
      setLoading(false); 
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const totales = calcularTotales();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.mode === 'dark' ? '#FAFAFA' : '#0F172A' }}>
          Nueva Factura
        </Typography>
        {empresa && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {empresa.razonSocial} · RUC {empresa.ruc}
          </Typography>
        )}
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Cliente
              {consultandoRuc && <CircularProgress size={16} sx={{ ml: 2 }} />}
            </Typography>
            <Autocomplete
              options={clientes}
              getOptionLabel={(o) => `${o.identificacion} - ${o.razonSocial || '[COMPLETAR DATOS]'}`}
              value={clienteSeleccionado}
              inputValue={busquedaCliente}
              onInputChange={(_, v) => {
                setBusquedaCliente(v);
                if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
                if (/^\d{13}$/.test(v)) {
                  debounceTimeout.current = setTimeout(() => consultarRuc(v), 500);
                }
              }}
              onChange={(_, v) => setClienteSeleccionado(v)}
              autoHighlight
              renderInput={(p) => (
                <TextField 
                  {...p} 
                  placeholder="Escribe RUC (13 dígitos) para validar" 
                  inputRef={clienteInputRef}
                  helperText="Escribe un RUC para validarlo automáticamente"
                  InputProps={{ 
                    ...p.InputProps, 
                    startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">{option.razonSocial || '[COMPLETAR DATOS]'}</Typography>
                    <Typography variant="caption" color="text.secondary">{option.identificacion}</Typography>
                  </Box>
                  {option.razonSocial && (
                    <Chip icon={<CheckCircle fontSize="small" />} label="Validado" size="small" color="success" variant="outlined" />
                  )}
                  {!option.razonSocial && (
                    <Chip icon={<Edit fontSize="small" />} label="Completar" size="small" color="warning" variant="outlined" />
                  )}
                </Box>
              )}
            />
            <TextField fullWidth type="date" value={factura.fechaEmision}
              onChange={(e) => setFactura({ ...factura, fechaEmision: e.target.value })}
              sx={{ mt: 2 }} size="small"
            />
            {clienteSeleccionado && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#F5F1E9', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Cliente seleccionado:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {clienteSeleccionado.razonSocial || '[COMPLETAR DATOS]'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {clienteSeleccionado.identificacion} · {clienteSeleccionado.tipoIdentificacion}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>Productos</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={7}>
                <Autocomplete options={productos} getOptionLabel={(o) => `${o.codigo} - ${o.nombre}`}
                  value={productoSeleccionado} onChange={(_, v) => { setProductoSeleccionado(v); setTimeout(() => cantidadInputRef.current?.focus(), 50); }}
                  renderInput={(p) => <TextField {...p} placeholder="Buscar producto" inputRef={productoInputRef} />}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2">{option.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">{option.codigo}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        ${Number(option.precioUnitario).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth type="number" placeholder="Cantidad" value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))} inputRef={cantidadInputRef}
                  onKeyPress={(e) => e.key === 'Enter' && productoSeleccionado && handleAgregarProducto()}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <Button fullWidth variant="contained" onClick={handleAgregarProducto}
                  disabled={!productoSeleccionado} startIcon={<Add />}>Agregar</Button>
              </Grid>
            </Grid>
            <TableContainer sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0A0A0A' : '#F9FAFB' }}>
                    <TableCell>Concepto</TableCell>
                    <TableCell align="right">Cant.</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Importe</TableCell>
                    <TableCell align="center" width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {factura.detalles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Añade tu primer producto con Ctrl+P
                      </TableCell>
                    </TableRow>
                  ) : (
                    factura.detalles.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell>{d.nombreProducto}<Typography variant="caption" display="block" color="textSecondary">{d.codigoProducto}</Typography></TableCell>
                        <TableCell align="right">{d.cantidad}</TableCell>
                        <TableCell align="right">${Number(d.precioUnitario).toFixed(2)}</TableCell>
                        <TableCell align="right">${Number(d.subtotal).toFixed(2)}</TableCell>
                        <TableCell align="center"><IconButton size="small" onClick={() => handleEliminarProducto(i)}><Delete fontSize="small" /></IconButton></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {factura.detalles.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Box sx={{ width: 240 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Subtotal</Typography>
                      <Typography variant="body2" color="text.primary">${(totales.subtotal15 + totales.subtotal0).toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">IVA 15%</Typography>
                      <Typography variant="body2" color="text.primary">${totales.iva15.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>TOTAL</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>${totales.total.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Tooltip title="Ctrl + Enter">
                <Button variant="contained" onClick={handleGuardarFactura}
                  disabled={loading || factura.detalles.length === 0 || !clienteSeleccionado}
                  startIcon={loading && <CircularProgress size={16} color="inherit" />}>
                  Guardar factura · ⌘↵
                </Button>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Modal para completar datos del cliente */}
      <Dialog open={modalCompletarAbierto} onClose={() => setModalCompletarAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Completar datos del cliente</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              RUC validado: <strong>{clientePendiente?.identificacion}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Razón Social *"
              value={datosCompletar.razonSocial}
              onChange={(e) => setDatosCompletar({ ...datosCompletar, razonSocial: e.target.value })}
              autoFocus
            />
            <TextField
              fullWidth
              label="Dirección"
              value={datosCompletar.direccion}
              onChange={(e) => setDatosCompletar({ ...datosCompletar, direccion: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={datosCompletar.email}
              onChange={(e) => setDatosCompletar({ ...datosCompletar, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Teléfono"
              value={datosCompletar.telefono}
              onChange={(e) => setDatosCompletar({ ...datosCompletar, telefono: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalCompletarAbierto(false)}>Cancelar</Button>
          <Button onClick={handleCompletarCliente} variant="contained">
            Guardar cliente
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Facturacion;