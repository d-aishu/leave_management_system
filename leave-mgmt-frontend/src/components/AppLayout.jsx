import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import { useAuth } from '../context/AuthContext';
import { formatRole } from '../utils/helpers';

const DRAWER_WIDTH = 248;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon />, roles: null },
  { label: 'Apply Leave', path: '/apply-leave', icon: <EventAvailableOutlinedIcon />, roles: null },
  { label: 'My Leaves', path: '/my-leaves', icon: <ListAltOutlinedIcon />, roles: null },
  {
    label: 'Leave Approvals',
    path: '/leave-approvals',
    icon: <FactCheckOutlinedIcon />,
    roles: ['MANAGER', 'ADMIN']
  },
  {
    label: 'Employees',
    path: '/employees',
    icon: <GroupOutlinedIcon />,
    roles: ['MANAGER', 'ADMIN']
  }
];

const AppLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || hasRole(...item.roles));

  const handleNav = (path) => {
    navigate(path);
    if (!isDesktop) setMobileOpen(false);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 2.5 }}>
        <BeachAccessOutlinedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark' }}>
          LeaveDesk
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 1.5, pt: 1.5 }}>
        {visibleItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => handleNav(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' },
                  '&:hover': { backgroundColor: 'primary.dark' }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: selected ? '#fff' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14.5, fontWeight: selected ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Signed in as
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {user?.name}
        </Typography>
        <Chip
          label={formatRole(user?.role)}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mt: 0.5 }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isDesktop && (
              <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="subtitle1" sx={{ color: '#fff' }}>
              {visibleItems.find((i) => i.path === location.pathname)?.label || 'LeaveDesk'}
            </Typography>
          </Box>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 14 }}>
              {initials}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled sx={{ opacity: '1 !important' }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Log out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isDesktop ? (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                borderRight: '1px solid',
                borderColor: 'divider'
              }
            }}
            open
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' }
            }}
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 9, md: 11 }
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
