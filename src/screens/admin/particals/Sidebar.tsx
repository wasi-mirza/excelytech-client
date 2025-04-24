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
import theme from '../../../shared/theme/theme';

const drawerWidth = 280;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  backgroundColor: theme.palette.secondary.dark,
  '& .MuiIconButton-root': {
    color: theme.palette.common.white,
  }
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

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.secondary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
    }
  }
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: theme.palette.common.white,
  minWidth: 40,
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiTypography-root': {
    color: theme.palette.common.white,
  }
}));

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
            <StyledListItemButton
              onClick={() => handleExpandClick(item.segment)}
              sx={{ pl: level * 2 + 2 }}
            >
              <StyledListItemIcon>{item.icon}</StyledListItemIcon>
              <StyledListItemText primary={item.title} />
              {isExpanded ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />}
            </StyledListItemButton>
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
        <StyledListItemButton
          onClick={() => navigate(item.segment)}
          sx={{ pl: level * 2 + 2 }}
          selected={location.pathname.includes(item.segment)}
        >
          <StyledListItemIcon>{item.icon}</StyledListItemIcon>
          <StyledListItemText primary={item.title} />
        </StyledListItemButton>
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
          backgroundColor: theme.palette.secondary.dark,
          '& .MuiDivider-root': {
            borderColor: 'rgba(255, 255, 255, 0.12)',
          },
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
        <Typography variant="subtitle1" sx={{ color: 'common.white' }}>
          Welcome, {auth?.user?.name ?? 'Admin'}
        </Typography>
      </Box>
      <Divider />
      <List>
        {navigation.map((item) => renderNavigationItem(item))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <StyledListItemButton onClick={handleLogout}>
            <StyledListItemIcon>
              <LogoutIcon />
            </StyledListItemIcon>
            <StyledListItemText primary="Logout" />
          </StyledListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar; 