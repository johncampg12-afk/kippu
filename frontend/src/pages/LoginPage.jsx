import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, TextField, Button, Alert, IconButton, InputAdornment, Divider } from '@mui/material';
import { Visibility, VisibilityOff, ArrowForward, Google as GoogleIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../services/api';

function LoginPage() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [particles, setParticles] = useState([]);

  // Login con Google
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await api.post('/auth/google', {
          token: tokenResponse.credential,
        });
        localStorage.setItem('token', response.data.access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        navigate('/dashboard');
      } catch (error) {
        setError('Error al iniciar sesión con Google');
      }
    },
    onError: () => setError('Error al iniciar sesión con Google'),
  });

  // Partículas flotantes
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 120; i++) {
      newParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }
    setParticles(newParticles);

    let animationFrame;
    let time = 0;
    const animate = () => {
      time += 0.02;
      setParticles(prev =>
        prev.map(p => {
          let newX = p.x + p.speedX;
          let newY = p.y + p.speedY;
          if (newX < 0) newX = window.innerWidth;
          if (newX > window.innerWidth) newX = 0;
          if (newY < 0) newY = window.innerHeight;
          if (newY > window.innerHeight) newY = 0;
          const pulseOpacity = p.opacity + Math.sin(time + p.pulse) * 0.1;
          return { ...p, x: newX, y: newY, opacity: Math.min(0.7, Math.max(0.1, pulseOpacity)) };
        })
      );
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      {/* Partículas */}
      <Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              bgcolor: `${theme.palette.secondary.main}80`,
              opacity: p.opacity,
              transform: 'translate(-50%, -50%)',
              transition: 'opacity 0.5s ease',
            }}
          />
        ))}
      </Box>

      {/* Formulario */}
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}>
                  <Box
                    component="img"
                    src="/kipu_condor.jpg"
                    alt="KIPPU"
                    sx={{ width: 36, height: 36, borderRadius: 2, objectFit: 'cover' }}
                  />
                  <Typography
                    sx={{
                      fontFamily: '"Fraunces", serif',
                      fontSize: 24,
                      fontWeight: 600,
                      color: 'primary.main',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    kippu
                  </Typography>
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Typography variant="h5" fontWeight={700} color="text.primary" mt={1}>
                  Bienvenido de vuelta
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Inicia sesión en tu cuenta
                </Typography>
              </motion.div>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: 'secondary.main',
                  '&:hover': { bgcolor: '#E04A0F' },
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 3,
                }}
              >
                {loading ? 'Iniciando...' : 'Iniciar sesión'}
              </Button>
            </form>

            {/* Separador y botón de Google */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                o
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => googleLogin()}
              sx={{
                py: 1.5,
                fontWeight: 500,
                borderRadius: 3,
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'background.default',
                },
              }}
            >
              Iniciar sesión con Google
            </Button>

            <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
              ¿No tienes cuenta?{' '}
              <Link to="/register" style={{ color: theme.palette.secondary.main, fontWeight: 500 }}>
                Regístrate
              </Link>
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default LoginPage;