import { Outlet } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../shared/utils/routes';
import AdminNavigationBar from './AdminNavigationBar';
import Sidebar from './Sidebar';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(0),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const AdminLayout = () => {
  const [auth, setAuth] = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setAuth({ user: null, token: '' });
          localStorage.removeItem('auth');
          localStorage.removeItem('token');
          window.location.href = ROUTES.AUTH.LOGIN;
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [setAuth]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* <AdminNavigationBar open={open} onDrawerToggle={handleDrawerToggle} /> */}
      <Sidebar open={open} onDrawerToggle={handleDrawerToggle} isMobile={isMobile} />
      <Main open={open}>
        {/* <DrawerHeader /> */}
        <Outlet />
      </Main>
    </Box>
  );
};

export default AdminLayout;
