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

export default function AppShell({ children, onToggleTheme, isDarkMode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/kipu_condor.jpg"
              alt="KIPU Cóndor"
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                objectFit: 'cover',
              }}
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