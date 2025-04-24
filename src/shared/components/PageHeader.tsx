import React from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  addButtonText?: string;
  onAddClick?: () => void;
  rightContent?: React.ReactNode;
  bgColor?: string;
  borderColor?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  addButtonText,
  onAddClick,
  rightContent,
  bgColor = '#65d9c8',
  borderColor = '#65d9c8',
  showBackButton = false,
  backUrl,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <Box
      sx={{
        mb: 4,
        p: 3,
        borderRadius: 2,
        bgcolor: alpha(bgColor, 0.1),
        border: `1px solid ${alpha(borderColor, 0.2)}`,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {showBackButton && (
            <IconButton
              onClick={handleBack}
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1,
              display: 'inline-block',
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {searchPlaceholder && onSearchChange && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: '100%', sm: 300 },
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover': {
                    '& > fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                },
              }}
            />
          )}

          {addButtonText && onAddClick && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddClick}
              sx={{
                bgcolor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
                boxShadow: theme.shadows[2],
                px: 3,
                whiteSpace: 'nowrap',
              }}
            >
              {addButtonText}
            </Button>
          )}

          {rightContent}
        </Box>
      </Box>
    </Box>
  );
};

export default PageHeader; 