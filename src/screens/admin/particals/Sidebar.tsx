import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  ShoppingCart as ShoppingCartIcon,
  ConfirmationNumber as TicketIcon,
  Chat as ChatIcon,
  Inventory as BoxIcon,
  Assignment as FileSignatureIcon,
  ExitToApp as LogoutIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const drawerWidth = 280;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const navigation = [
  {
    segment: 'home',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'allusers',
    title: 'Account Centre',
    icon: <PeopleIcon />,
  },
  {
    segment: 'productSuite',
    title: 'Product Suite',
    icon: <BoxIcon />,
    children: [
      {
        segment: 'categories',
        title: 'Categories',
        icon: <CategoryIcon />,
      },
      {
        segment: 'products',
        title: 'Products',
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    segment: 'subscriptions',
    title: 'Subscriptions',
    icon: <ShoppingCartIcon />,
  },
  {
    segment: 'leadsAndMarketing',
    title: 'Leads and Quotes',
    icon: <FileSignatureIcon />,
    children: [
      {
        segment: 'proposals',
        title: 'All Proposals',
        icon: <DescriptionIcon />,
      },
      {
        segment: 'proposaltemplates',
        title: 'Proposal Templates',
        icon: <DescriptionIcon />,
      },
      {
        segment: 'email-templates',
        title: 'Email Templates',
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    segment: 'tickets',
    title: 'Service Desk',
    icon: <TicketIcon />,
  },
  {
    segment: 'chats',
    title: 'Chat',
    icon: <ChatIcon />,
  },
];

interface SidebarProps {
  open: boolean;
  onDrawerToggle: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onDrawerToggle, isMobile }) => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleExpandClick = (segment: string) => {
    setExpandedItems((prev) =>
      prev.includes(segment)
        ? prev.filter((item) => item !== segment)
        : [...prev, segment]
    );
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  const renderNavigationItem = (item: any, level = 0) => {
    if (item.children) {
      const isExpanded = expandedItems.includes(item.segment);
      return (
        <React.Fragment key={item.segment}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleExpandClick(item.segment)}
              sx={{ pl: level * 2 + 2 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} />
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child: any) =>
                renderNavigationItem(child, level + 1)
              )}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <ListItem key={item.segment} disablePadding>
        <ListItemButton
          onClick={() => navigate(item.segment)}
          sx={{ pl: level * 2 + 2 }}
          selected={location.pathname.includes(item.segment)}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.title} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={onDrawerToggle}
    >
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', px: 2 }}>
          <img
            src="/img/excelytech-logo.png"
            alt="excelytech-logo"
            style={{ width: '100%', height: '100%' }}
          />
        </Box>
        <IconButton onClick={onDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1">
          {auth?.user?.name ?? 'Admin'}
        </Typography>
      </Box>
      <Divider />
      <List>
        {navigation.map((item) => renderNavigationItem(item))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar; 