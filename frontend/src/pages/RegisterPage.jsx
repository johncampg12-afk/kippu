import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button, Alert,
  Grid, Divider, CircularProgress
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    ruc: '',
    razonSocial: '',
    nombreComercial: '',
    direccionMatriz: '',
    codigoEstablecimiento: '001',
    codigoPuntoEmision: '001',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.ruc.length !== 13) {
      setError('El RUC debe tener 13 dígitos');
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ruc: formData.ruc,
        razonSocial: formData.razonSocial,
        nombreComercial: formData.nombreComercial,
        direccionMatriz: formData.direccionMatriz,
        codigoEstablecimiento: formData.codigoEstablecimiento || '001',
        codigoPuntoEmision: formData.codigoPuntoEmision || '001',
      };

      await register(registerData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Fraunces", serif',
            fontWeight: 600,
            mb: 1,
            textAlign: 'center',
            color: 'text.primary',
          }}
        >
          Crear cuenta en KIPU
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}
        >
          Comienza a facturar electrónicamente en Ecuador
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* Datos del usuario */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: '"Fraunces", serif' }}>
            Datos de acceso
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                helperText="Mínimo 8 caracteres"
                inputProps={{ minLength: 8 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirmar contraseña"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Datos de la empresa */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: '"Fraunces", serif' }}>
            Datos de la empresa (Emisor)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RUC"
                name="ruc"
                value={formData.ruc}
                onChange={handleChange}
                required
                inputProps={{ maxLength: 13, pattern: '[0-9]*' }}
                helperText="13 dígitos"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Establecimiento"
                name="codigoEstablecimiento"
                value={formData.codigoEstablecimiento}
                onChange={handleChange}
                required
                defaultValue="001"
                inputProps={{ maxLength: 3 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Punto Emisión"
                name="codigoPuntoEmision"
                value={formData.codigoPuntoEmision}
                onChange={handleChange}
                required
                defaultValue="001"
                inputProps={{ maxLength: 3 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Razón Social"
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre Comercial"
                name="nombreComercial"
                value={formData.nombreComercial}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección Matriz"
                name="direccionMatriz"
                value={formData.direccionMatriz}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Crear cuenta'}
            </Button>
          </Box>
        </form>

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'inherit' }}>Inicia sesión</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default RegisterPage;