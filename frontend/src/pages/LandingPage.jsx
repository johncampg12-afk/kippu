import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { Receipt, Security, Speed } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero */}
      <Container maxWidth="lg" sx={{ pt: 10, pb: 6 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Facturación Electrónica <Box component="span" sx={{ color: 'secondary.main' }}>Ecuador</Box>
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', mb: 4, fontWeight: 400 }}>
              Emite facturas, valida RUCs y envía comprobantes al SRI en segundos. El ERP que tu negocio merece.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" size="large" onClick={() => navigate('/register')}>
                Comenzar gratis
              </Button>
              <Button variant="outlined" size="large" onClick={() => navigate('/login')}>
                Iniciar sesión
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontFamily: '"Fraunces", serif', mb: 2 }}>KIPU en acción</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {['Valida RUC automáticamente', 'Calcula IVA 15%', 'Genera XML y PDF', 'Envía al SRI en un clic'].map((text, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Receipt sx={{ color: 'secondary.main' }} />
                    <Typography>{text}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Características */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', textAlign: 'center', mb: 6 }}>
          ¿Por qué KIPU?
        </Typography>
        <Grid container spacing={4}>
          {[
            { icon: <Speed sx={{ fontSize: 40 }} />, title: 'Rápido', desc: 'Atajos de teclado para facturar en segundos' },
            { icon: <Security sx={{ fontSize: 40 }} />, title: 'Seguro', desc: 'Validación fiscal real con módulo 11' },
            { icon: <Receipt sx={{ fontSize: 40 }} />, title: 'Completo', desc: 'XML, PDF, Excel y envío al SRI' },
          ].map((feature, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                <Box sx={{ color: 'secondary.main', mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{feature.title}</Typography>
                <Typography variant="body2" color="text.secondary">{feature.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.main', color: 'background.paper', py: 4, textAlign: 'center' }}>
        <Typography variant="body2">© 2026 KIPU — Facturación Electrónica Ecuador</Typography>
      </Box>
    </Box>
  );
}

export default LandingPage;