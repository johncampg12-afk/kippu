import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box, Typography, Button, Container, Grid, Paper, Chip, IconButton,
} from '@mui/material';
import {
  Receipt, Security, Speed, CheckCircle, TrendingUp,
  Description, CloudUpload, Analytics, PriceCheck,
  History, ArrowForward, PlayArrow, PauseCircle,
  NavigateBefore, NavigateNext,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Datos de las herramientas para el carrusel
const tools = [
  {
    id: 1,
    title: 'Validación RUC',
    description: 'Valida el RUC de tus clientes con el algoritmo oficial del SRI. Sin APIs externas.',
    icon: <Security sx={{ fontSize: 24 }} />,
    gradient: 'linear-gradient(135deg, #FF5A1F 0%, #FF7A45 100%)',
    bgGlow: 'rgba(255,90,31,0.1)',
  },
  {
    id: 2,
    title: 'Cálculo IVA 15%',
    description: 'Aplica automáticamente el IVA del 15% y otros impuestos. Siempre actualizado.',
    icon: <PriceCheck sx={{ fontSize: 24 }} />,
    gradient: 'linear-gradient(135deg, #0A0A0A 0%, #333 100%)',
    bgGlow: 'rgba(10,10,10,0.1)',
  },
  {
    id: 3,
    title: 'XML y PDF',
    description: 'Genera el XML para el SRI y el RIDE profesional en un solo clic.',
    icon: <Description sx={{ fontSize: 24 }} />,
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    bgGlow: 'rgba(5,150,105,0.1)',
  },
  {
    id: 4,
    title: 'Envío al SRI',
    description: 'Firma y envía comprobantes al Web Service del SRI. Entorno de pruebas y producción.',
    icon: <CloudUpload sx={{ fontSize: 24 }} />,
    gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
    bgGlow: 'rgba(37,99,235,0.1)',
  },
  {
    id: 5,
    title: 'Dashboard',
    description: 'KPIs en tiempo real: facturas del mes, por cobrar, vencen hoy. Decisiones informadas.',
    icon: <Analytics sx={{ fontSize: 24 }} />,
    gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    bgGlow: 'rgba(217,119,6,0.1)',
  },
  {
    id: 6,
    title: 'Historial',
    description: 'Filtra, busca y exporta a Excel. Todo lo que tu contador necesita.',
    icon: <History sx={{ fontSize: 24 }} />,
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
    bgGlow: 'rgba(124,58,237,0.1)',
  },
];

// Componente Carrusel
function ToolsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const total = tools.length;

  useEffect(() => {
    if (isAutoPlaying && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % total);
      }, 2000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, isPaused, total]);

  const goTo = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(true);
    setIsPaused(false);
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
    setIsAutoPlaying(true);
    setIsPaused(false);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setIsAutoPlaying(true);
    setIsPaused(false);
  };

  const toggleAutoPlay = () => {
    setIsPaused(!isPaused);
  };

  const getCardStyle = (index) => {
    const diff = (index - currentIndex + total) % total;
    if (diff === 0) return { scale: 1, opacity: 1, zIndex: 10, x: 0, blur: 0 };
    if (diff === 1) return { scale: 0.85, opacity: 0.7, zIndex: 5, x: '30%', blur: 4 };
    if (diff === total - 1) return { scale: 0.85, opacity: 0.7, zIndex: 5, x: '-30%', blur: 4 };
    return { scale: 0.7, opacity: 0.3, zIndex: 0, x: diff === 2 ? '60%' : '-60%', blur: 8, display: 'none' };
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden', py: 4 }}>
      {/* Controles */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 4 }}>
        <IconButton onClick={prev} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 1 }}>
          <NavigateBefore />
        </IconButton>
        <Button
          onClick={toggleAutoPlay}
          variant="outlined"
          startIcon={isPaused ? <PlayArrow /> : <PauseCircle />}
          size="small"
        >
          {isPaused ? 'Play' : 'Pause'}
        </Button>
        <IconButton onClick={next} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 1 }}>
          <NavigateNext />
        </IconButton>
      </Box>

      {/* Tarjetas */}
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        {tools.map((tool, idx) => {
          const style = getCardStyle(idx);
          if (style.display === 'none') return null;
          const isActive = idx === currentIndex;
          return (
            <motion.div
              key={tool.id}
              className="absolute cursor-pointer"
              style={{
                width: '100%',
                maxWidth: 400,
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB',
                padding: 24,
                scale: style.scale,
                opacity: style.opacity,
                zIndex: style.zIndex,
                filter: `blur(${style.blur}px)`,
              }}
              animate={{
                x: style.x,
                scale: style.scale,
                opacity: style.opacity,
                filter: `blur(${style.blur}px)`,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => goTo(idx)}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: tool.bgGlow,
                  borderRadius: '16px',
                  opacity: 0.3,
                  pointerEvents: 'none',
                }}
              />
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 1.5,
                    borderRadius: 2,
                    background: tool.gradient,
                    color: '#fff',
                    mb: 2,
                    boxShadow: 2,
                  }}
                >
                  {tool.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                  {tool.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {tool.description}
                </Typography>
                {isActive && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #E5E7EB' }}>
                    <Button size="small" color="secondary" sx={{ fontWeight: 500 }}>
                      Saber más →
                    </Button>
                  </motion.div>
                )}
              </Box>
            </motion.div>
          );
        })}
      </Box>

      {/* Indicadores */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 4 }}>
        {tools.map((_, idx) => (
          <Box
            key={idx}
            onClick={() => goTo(idx)}
            sx={{
              height: 8,
              borderRadius: 4,
              transition: 'all 0.3s',
              width: idx === currentIndex ? 32 : 8,
              bgcolor: idx === currentIndex ? 'secondary.main' : '#D1D5DB',
              cursor: 'pointer',
              '&:hover': { bgcolor: idx === currentIndex ? 'secondary.main' : '#9CA3AF' },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default function LandingPage() {
  const canvasRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();

  // Partículas flotantes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let animationId;
    let time = 0;
    const animate = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        const pulseAlpha = p.alpha + Math.sin(time + p.pulse) * 0.1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + Math.sin(time + p.pulse) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 90, 31, ${Math.max(0.05, Math.min(0.5, pulseAlpha))})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Efecto de scroll para header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animación de entrada
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            entry.target.classList.remove('opacity-0');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', position: 'relative', overflowX: 'hidden' }}>
      {/* Canvas de partículas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          background: scrolled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #E5E7EB',
          transition: 'all 0.3s',
          boxShadow: scrolled ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
        }}
      >
        <Container maxWidth="lg" sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <motion.div whileHover={{ scale: 1.05, rotate: 2 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Box
                component="img"
                src="/kipu_condor.jpg"
                alt="KIPU"
                sx={{ width: 32, height: 32, borderRadius: 2, objectFit: 'cover' }}
              />
            </motion.div>
            <Typography
              sx={{
                fontFamily: '"Fraunces", serif',
                fontSize: 22,
                fontWeight: 600,
                color: 'primary.main',
                letterSpacing: '-0.02em',
              }}
            >
              kipu
            </Typography>
          </Link>

          {/* Acciones */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                sx={{
                  bgcolor: 'secondary.main',
                  '&:hover': { bgcolor: '#E04A0F' },
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Comenzar gratis
              </Button>
            </motion.div>
            <Button component={Link} to="/login" variant="text" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Iniciar sesión
            </Button>
          </Box>
        </Container>
      </motion.header>

      {/* Hero Section */}
      <Box component="section" sx={{ position: 'relative', zIndex: 10, pt: 16, pb: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Chip
                icon={<Speed sx={{ color: 'secondary.main' }} />}
                label="Facturación Electrónica Ecuador"
                variant="outlined"
                sx={{
                  mb: 3,
                  borderColor: 'secondary.main',
                  color: 'secondary.main',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ fontSize: '3.5rem', fontWeight: 700, color: '#0A0A0A', lineHeight: 1.2, marginBottom: 16 }}
            >
              Facturación electrónica{' '}
              <span style={{ color: '#FF5A1F' }}>rápida y sin complicaciones</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: '1.25rem', color: '#5C544B', maxWidth: 600, margin: '0 auto 32px' }}
            >
              Valida RUCs, calcula IVA 15%, genera XML y PDF, y envía tus comprobantes al SRI en segundos.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: 'secondary.main',
                  '&:hover': { bgcolor: '#E04A0F' },
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 3,
                }}
              >
                Empezar ahora
              </Button>
              <Button
                component={Link}
                to="#como-funciona"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'divider',
                  color: 'text.primary',
                  px: 4,
                  py: 1.5,
                  fontWeight: 500,
                  borderRadius: 3,
                  '&:hover': { bgcolor: '#F5F1E9' },
                }}
              >
                Cómo funciona
              </Button>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ marginTop: 24, color: '#5C544B', fontSize: '0.875rem' }}>
              ✨ Sin tarjeta de crédito • Plan gratuito disponible
            </motion.p>
          </Box>
        </Container>
      </Box>

      {/* Cómo funciona (Learning Loop) */}
      <Box component="section" id="como-funciona" sx={{ py: 12, bgcolor: '#F5F1E9', position: 'relative', zIndex: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="El proceso" variant="outlined" sx={{ mb: 2, borderColor: 'secondary.main', color: 'secondary.main' }} />
            <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
              Empieza a facturar en <span style={{ color: '#FF5A1F' }}>menos de 2 minutos</span>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              KIPU aprende de tus clientes frecuentes y automatiza todo el proceso fiscal.
            </Typography>
          </Box>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              {[
                { num: '1', title: 'Registra tu empresa', desc: 'Sube tu certificado .p12 y configura los datos del emisor.' },
                { num: '2', title: 'Valida RUC automáticamente', desc: 'Escribe un RUC y KIPU lo valida con el algoritmo oficial del SRI.' },
                { num: '3', title: 'Emite la factura', desc: 'Agrega productos, calcula IVA 15% y guarda. XML y PDF se generan al instante.' },
                { num: '4', title: 'Envía al SRI', desc: 'Firma el comprobante y envíalo al Web Service del SRI con un clic.' },
              ].map((step) => (
                <Box key={step.num} className="animate-on-scroll opacity-0" sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: '#FF5A1F',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      flexShrink: 0,
                    }}
                  >
                    {step.num}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper className="animate-on-scroll opacity-0" sx={{ p: 4, borderRadius: 4, bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Security sx={{ color: 'secondary.main', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    ¿Por qué KIPU?
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  A diferencia de otras herramientas, KIPU no depende de APIs externas que fallan. Validamos el RUC con el algoritmo oficial del SRI y guardamos los datos localmente para que la próxima consulta sea instantánea.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    'Validación fiscal módulo 11 (sin internet)',
                    'Caché inteligente: tus clientes frecuentes se autocompletan',
                    'Envío directo al SRI cuando tengas tu certificado .p12',
                  ].map((text, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: '#059669', fontSize: 18 }} />
                      <Typography variant="body2">{text}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Herramientas - Carrusel */}
      <Box component="section" id="funcionalidades" sx={{ py: 12, position: 'relative', zIndex: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
              Todo lo que necesitas para{' '}
              <span style={{ color: '#FF5A1F' }}>facturar en Ecuador</span>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              KIPU integra validación, cálculo de impuestos, generación de documentos y envío al SRI en un solo lugar.
            </Typography>
          </Box>
          <ToolsCarousel />
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 10, bgcolor: '#F5F1E9', borderTop: '1px solid #D6CFC2', borderBottom: '1px solid #D6CFC2', position: 'relative', zIndex: 10 }}>
        <Container maxWidth="md">
          <Grid container spacing={4} textAlign="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                100% Ecuador
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Adaptado a la normativa SRI 2026
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                IVA 15%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cálculo automático actualizado
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                Sin APIs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Validación offline, siempre disponible
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box component="section" sx={{ py: 12, position: 'relative', zIndex: 10 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Paper sx={{ p: 6, borderRadius: 4, bgcolor: '#fff', border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
              ¿Listo para automatizar tu facturación?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Únete a los negocios ecuatorianos que ya confían en KIPU para emitir sus comprobantes electrónicos.
            </Typography>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: 'secondary.main',
                '&:hover': { bgcolor: '#E04A0F' },
                px: 5,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 3,
              }}
            >
              Crear cuenta gratis
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Sin tarjeta de crédito • Plan gratuito disponible
            </Typography>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ borderTop: '1px solid #D6CFC2', py: 4, textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3, mb: 2 }}>
            <Link to="/terms" style={{ color: '#5C544B', textDecoration: 'none', fontSize: '0.875rem' }}>Términos</Link>
            <Link to="/privacy" style={{ color: '#5C544B', textDecoration: 'none', fontSize: '0.875rem' }}>Privacidad</Link>
            <Link to="/contact" style={{ color: '#5C544B', textDecoration: 'none', fontSize: '0.875rem' }}>Contacto</Link>
          </Box>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} KIPU — Facturación Electrónica Ecuador
          </Typography>
        </Container>
      </Box>

      {/* Estilos de animación */}
      <style>{`
        .animate-on-scroll { opacity: 0; }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Box>
  );
}