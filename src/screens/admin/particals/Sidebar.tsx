import React, { useState } from "react";
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
  Tooltip,
  Popover,
} from "@mui/material";
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
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import theme from "../../../shared/theme/theme";
import AuthService from "../../../shared/utils/authService";

const expandedDrawerWidth = 280;
const collapsedDrawerWidth = 80;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
  backgroundColor: theme.palette.secondary.dark,
  "& .MuiIconButton-root": {
    color: theme.palette.common.white,
  },
}));

const navigation = [
  {
    segment: "home",
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "allusers",
    title: "Account Centre",
    icon: <PeopleIcon />,
  },
  {
    segment: "productSuite",
    title: "Product Suite",
    icon: <BoxIcon />,
    children: [
      {
        segment: "categories",
        title: "Categories",
        icon: <CategoryIcon />,
      },
      {
        segment: "products",
        title: "Products",
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    segment: "subscriptions",
    title: "Subscriptions",
    icon: <ShoppingCartIcon />,
  },
  {
    segment: "leadsAndMarketing",
    title: "Leads and Quotes",
    icon: <FileSignatureIcon />,
    children: [
      {
        segment: "proposals",
        title: "All Proposals",
        icon: <DescriptionIcon />,
      },
      {
        segment: "proposaltemplates",
        title: "Proposal Templates",
        icon: <DescriptionIcon />,
      },
      {
        segment: "email-templates",
        title: "Email Templates",
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    segment: "tickets",
    title: "Service Desk",
    icon: <TicketIcon />,
  },
  {
    segment: "chats",
    title: "Chat",
    icon: <ChatIcon />,
  },
];

interface SidebarProps {
  open: boolean;
  onDrawerToggle: () => void;
  isMobile: boolean;
}

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.secondary.light,
  },
  "&.Mui-selected": {
    backgroundColor: theme.palette.secondary.main,
    "&:hover": {
      backgroundColor: theme.palette.secondary.light,
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: theme.palette.common.white,
  minWidth: 0, // important to prevent gap when collapsed
  display: "flex",
  justifyContent: "center",
}));

const StyledListItemText = styled(ListItemText, {
  shouldForwardProp: (prop) => prop !== "collapsed",
})<{ collapsed: boolean }>(({ theme, collapsed }) => ({
  overflow: "hidden",
  whiteSpace: "nowrap",
  transition: "opacity 0.3s ease, max-width 0.3s ease",
  opacity: collapsed ? 0 : 1,
  maxWidth: collapsed ? 0 : 200,
  "& .MuiTypography-root": {
    color: theme.palette.common.white,
  },
}));

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onDrawerToggle,
  isMobile,
}) => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [popoverItems, setPopoverItems] = useState<any[]>([]);

  const drawerWidth = collapsed ? collapsedDrawerWidth : expandedDrawerWidth;

  const handleExpandClick = (segment: string) => {
    setExpandedItems((prev) =>
      prev.includes(segment)
        ? prev.filter((item) => item !== segment)
        : [...prev, segment]
    );
  };

  const authService = new AuthService(setAuth, navigate);

  const handleLogout = () => {
    authService.handleLogout();
  };

  const renderNavigationItem = (item: any, level = 0) => {
    const isExpanded = expandedItems.includes(item.segment);
    const isSelected = location.pathname.includes(item.segment);

    return (
      <React.Fragment key={item.segment}>
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip
            title={item.title}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <StyledListItemButton
              onClick={(e) => {
                if (collapsed && item.children) {
                  setAnchorEl(e.currentTarget);
                  setPopoverItems(item.children);
                } else if (!item.children) {
                  navigate(item.segment);
                } else {
                  handleExpandClick(item.segment);
                }
              }}
              selected={isSelected}
              sx={{
                pl: collapsed ? 1 : level * 2 + 2,
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <StyledListItemIcon sx={{ minWidth: collapsed ? 0 : 40 }}>
                {item.icon}
              </StyledListItemIcon>
              <StyledListItemText primary={item.title} collapsed={collapsed} />
              {!collapsed &&
                item.children &&
                (isExpanded ? (
                  <ExpandLess sx={{ color: "white" }} />
                ) : (
                  <ExpandMore sx={{ color: "white" }} />
                ))}
            </StyledListItemButton>
          </Tooltip>
        </ListItem>
        {!collapsed && item.children && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child: any) =>
                renderNavigationItem(child, level + 1)
              )}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: theme.palette.secondary.dark,
          overflowX: "hidden",
          transition: theme.transitions.create(["width", "min-width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <DrawerHeader>
        {!collapsed ? (
          <Box
            sx={{ display: "flex", alignItems: "center", width: "100%", px: 2 }}
          >
            <img
              src="/img/excelytech-logo.png"
              alt="excelytech-logo"
              style={{ width: "70%", height: "100%" }}
            />
          </Box>
        ) : (
          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <img
              src="/img/excelytech-favicon.png"
              alt="excelytech-logo"
              style={{ width: 20, height: 20 }}
            />
          </Box>
        )}
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            transition: "transform 0.3s ease",
          }}
        >
          <ChevronLeftIcon
            sx={{
              transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </IconButton>
      </DrawerHeader>
      <Divider />
      {!collapsed && (
        <>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ color: "common.white" }}>
              Welcome, {auth?.user?.name ?? "Admin"}
            </Typography>
          </Box>
          <Divider />
        </>
      )}
      <List>{navigation.map((item) => renderNavigationItem(item))}</List>
      <Divider />
      <List>
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip
            title={"Logout"}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <StyledListItemButton
              onClick={handleLogout}
              sx={{ justifyContent: collapsed ? "center" : "flex-start" }}
            >
              <StyledListItemIcon sx={{ minWidth: collapsed ? 0 : 40 }}>
                <LogoutIcon />
              </StyledListItemIcon>
              <StyledListItemText primary={"Logout"} collapsed={collapsed} />
            </StyledListItemButton>
          </Tooltip>
        </ListItem>
      </List>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.secondary.dark,
            color: theme.palette.common.white,
            mt: 1,
          },
        }}
      >
        <List dense>
          {popoverItems.map((child: any) => (
            <ListItem key={child.segment} disablePadding>
              <StyledListItemButton
                onClick={() => {
                  navigate(child.segment);
                  setAnchorEl(null);
                }}
              >
                <StyledListItemIcon>{child.icon}</StyledListItemIcon>
                <StyledListItemText
                  primary={child.title}
                  collapsed={!collapsed}
                />
              </StyledListItemButton>
            </ListItem>
          ))}
        </List>
      </Popover>
    </Drawer>
  );
};

export default Sidebar;
