import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  useTheme,
} from '@mui/material';

interface InfoItem {
  label: string;
  value: string | number | boolean | React.ReactNode;
}

interface InfoCardProps {
  title: string | React.ReactNode;
  items: InfoItem[];
  headerColor?: string;
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  items,
  headerColor,
  children,
  rightContent,
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%', boxShadow: theme.shadows[2] }}>
      <CardHeader
        title={title}
        sx={{
          bgcolor: headerColor || theme.palette.primary.light,
          color: 'white',
          '& .MuiCardHeader-title': {
            fontSize: '1.1rem',
            fontWeight: 600,
          },
        }}
      />
      <CardContent>
        {items.length > 0 && (
          <Box sx={{ display: 'grid', gap: 2 }}>
            {items.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', fontWeight: 600 }}
                >
                  {item.label}:
                </Typography>
                <Typography variant="body2">
                  {typeof item.value === 'boolean'
                    ? item.value
                      ? 'Yes'
                      : 'No'
                    : item.value || 'Not available'}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        {children}
        {rightContent && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            {rightContent}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default InfoCard; 