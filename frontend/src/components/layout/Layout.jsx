import React, { useState } from 'react';
import {
  Box, Drawer, Toolbar, List, ListItem, ListItemIcon,
  ListItemText, Typography, Avatar, IconButton, Dialog,
  DialogContent, useTheme,
} from '@mui/material';
import {
  Dashboard, Receipt, People, Settings, Inventory,
  History, DarkMode, LightMode,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import CommandPalette from '../components/common/CommandPalette';

const drawerWidth = 220;

const menuItems = [
  { text: 'Dashboard', icon: Dashboard, path: '/' },
  { text: 'Ventas', icon: Receipt, path: '/facturacion' },
  { text: 'Historial', icon: History, path: '/historial' },
  { text: 'Clientes', icon: People, path: '/clientes' },
  { text: 'Productos', icon: Inventory, path: '/productos' },
  { text: 'Ajustes', icon: Settings, path: '/empresa' },
];

// Logo KIPU SVG
const KipuLogo = () => (
  <svg width="28" height="28" viewBox="0 0 100 100" fill="none" style={{ color: 'inherit' }}>
    <path d="M20 35 L50 50 L35 60 M65 25 L85 15 M85 15 L75 25 M50 50 C45 35 60 30 65 45 C70 60 50 75 35 60 M35 60 L25 75 L30 85 L45 85 L55 70" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="57" cy="52" r="5" fill="none" stroke="currentColor" strokeWidth="4"/>
  </svg>
);

export default function AppShell({ children, onToggleTheme, isDarkMode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const pageTitle = menuItems.find(i => i.path === location.pathname)?.text || 'KIPU';

  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    setCommandOpen(true);
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Toolbar sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: 'primary.main' }}>
              <KipuLogo />
            </Box>
            <Typography 
              sx={{ 
                fontFamily: '"Fraunces", serif', 
                fontSize: 22, 
                fontWeight: 600,
                color: 'primary.main',
                letterSpacing: '-0.02em',
              }}
            >
              Kipu
            </Typography>
          </Box>
        </Toolbar>
        
        <Box sx={{ px: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28, fontSize: 12, color: theme.palette.mode === 'dark' ? '#000' : '#F5F1E9' }}>JP</Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Juan Pérez
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                admin@kipu.ec
              </Typography>
            </Box>
          </Box>
        </Box>

        <List sx={{ px: 1, mt: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem
                key={item.text}
                button
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1,
                  bgcolor: isActive ? (theme.palette.mode === 'dark' ? '#1A1A1A' : '#E8E2D5') : 'transparent',
                  '&:hover': { 
                    bgcolor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#E8E2D5' 
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'primary.main' : 'text.secondary' }}>
                  <item.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ mt: 'auto', p: 2 }}>
          <IconButton onClick={onToggleTheme} sx={{ color: 'text.secondary' }}>
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth}px)`,
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
          {children}
        </Box>
      </Box>

      <Dialog 
        open={commandOpen} 
        onClose={() => setCommandOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}