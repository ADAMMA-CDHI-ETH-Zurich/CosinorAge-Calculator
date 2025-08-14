import React from 'react';
import { Box, Typography } from '@mui/material';

const ModernDivider = ({ 
  title, 
  subtitle, 
  variant = 'default',
  sx = {} 
}) => {
  const variants = {
    default: {
      container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        my: 4,
        position: 'relative',
      },
      line: {
        flex: 1,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(0, 102, 204, 0.3), transparent)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#0066CC',
          boxShadow: '0 0 10px rgba(0, 102, 204, 0.5)',
          animation: 'pulse 2s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': { 
            transform: 'translate(-50%, -50%) scale(1)',
            opacity: 1,
          },
          '50%': { 
            transform: 'translate(-50%, -50%) scale(1.2)',
            opacity: 0.7,
          },
        },
      },
      content: {
        mx: 3,
        textAlign: 'center',
      },
    },
    centered: {
      container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        my: 6,
        position: 'relative',
      },
      line: {
        width: '100%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.4), rgba(0, 102, 204, 0.2), transparent)',
        position: 'relative',
        mb: 2,
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0066CC, #3385D6)',
          boxShadow: '0 0 15px rgba(0, 102, 204, 0.6)',
          animation: 'rotate 3s linear infinite',
        },
        '@keyframes rotate': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
      },
      content: {
        textAlign: 'center',
        mt: 2,
      },
    },
    minimal: {
      container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        my: 3,
      },
      line: {
        width: '60px',
        height: '3px',
        background: 'linear-gradient(90deg, #0066CC, #3385D6)',
        borderRadius: '2px',
        position: 'relative',
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#0066CC',
        },
        '&::before': {
          left: '-10px',
          animation: 'fadeInOut 2s ease-in-out infinite',
        },
        '&::after': {
          right: '-10px',
          animation: 'fadeInOut 2s ease-in-out infinite 1s',
        },
        '@keyframes fadeInOut': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 1 },
        },
      },
      content: {
        mx: 2,
        textAlign: 'center',
      },
    },
  };

  const currentVariant = variants[variant];

  return (
    <Box sx={{ ...currentVariant.container, ...sx }}>
      <Box sx={currentVariant.line} />
      {(title || subtitle) && (
        <Box sx={currentVariant.content}>
          {title && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                mb: subtitle ? 0.5 : 0,
                letterSpacing: '0.02em',
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                letterSpacing: '0.01em',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      <Box sx={currentVariant.line} />
    </Box>
  );
};

export default ModernDivider; 