import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  IconButton,
  Menu,
  Grid,
  MenuItem,
  Typography,
  useTheme
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { alpha } from '@mui/material/styles';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  iconColor?: string;
  sx?: any;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  bgColor,
  iconColor,
  sx,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card
      sx={{
        width: 320,
        height: 200,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: bgColor,
        color: 'black',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: theme.shadows[4],
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        '&:after': {
          content: '""',
          position: 'absolute',
          width: 200,
          height: 200,
          background: theme.palette.primary.dark,
          borderRadius: '50%',
          top: -80,
          right: -80,
          opacity: 0.15,
          transition: 'opacity 0.3s ease-in-out',
        },
        '&:hover:after': {
          opacity: 0.25,
        },
        ...sx,
      }}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Grid item>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: alpha(iconColor || theme.palette.primary.main, 0.1),
                color: iconColor || theme.palette.primary.main,
              }}
            >
              {icon}
            </Box>
          </Grid>
          <Grid item>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
              size="small"
            >
              <MoreHorizIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  boxShadow: theme.shadows[3],
                }
              }}
            >
              <MenuItem onClick={handleMenuClose}>Refresh</MenuItem>
              <MenuItem onClick={handleMenuClose}>Export</MenuItem>
            </Menu>
          </Grid>
        </Grid>

        <Box sx={{ mt: 'auto' }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              opacity: 0.8,
              mb: 1,
              fontWeight: 500
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              letterSpacing: '-0.5px'
            }}
          >
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
