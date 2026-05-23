import React, { useState } from 'react';
import { Box, Container, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontFamily: '"Fraunces", serif', mb: 3, textAlign: 'center' }}>
          Iniciar sesión en KIPU
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }} required />
          <TextField fullWidth label="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} sx={{ mb: 3 }} required />
          <Button fullWidth variant="contained" type="submit" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          ¿No tienes cuenta? <Link to="/register" style={{ color: 'inherit' }}>Regístrate</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default LoginPage;