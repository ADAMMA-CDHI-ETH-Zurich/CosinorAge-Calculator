import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const ModernLoadingSpinner = ({ message = "Processing...", size = "medium" }) => {
  const sizeMap = {
    small: { spinner: 40, container: 120 },
    medium: { spinner: 60, container: 160 },
    large: { spinner: 80, container: 200 }
  };

  const dimensions = sizeMap[size];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: dimensions.container,
        height: dimensions.container,
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          animation: 'shimmer 2s infinite',
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      }}
    >
      {/* Animated background circles */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(0, 102, 204, 0.3), rgba(0, 102, 204, 0.1))',
          animation: 'float 3s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) scale(1)' },
            '50%': { transform: 'translateY(-10px) scale(1.1)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '20%',
          width: '15px',
          height: '15px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(46, 125, 50, 0.3), rgba(46, 125, 50, 0.1))',
          animation: 'float 3s ease-in-out infinite 1s',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          left: '10%',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(211, 47, 47, 0.3), rgba(211, 47, 47, 0.1))',
          animation: 'float 3s ease-in-out infinite 2s',
        }}
      />

      {/* Main spinner */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <CircularProgress
          size={dimensions.spinner}
          thickness={4}
          sx={{
            color: 'primary.main',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
              animation: 'spin 1.5s linear infinite',
            },
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        />
        
        {/* Inner pulse effect */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: dimensions.spinner * 0.6,
            height: dimensions.spinner * 0.6,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 102, 204, 0.2) 0%, transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { 
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 0.5,
              },
              '50%': { 
                transform: 'translate(-50%, -50%) scale(1.2)',
                opacity: 0.8,
              },
            },
          }}
        />
      </Box>

      {/* Loading text */}
      <Typography
        variant="body2"
        sx={{
          mt: 2,
          color: 'text.secondary',
          fontWeight: 500,
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          animation: 'fadeInOut 2s ease-in-out infinite',
          '@keyframes fadeInOut': {
            '0%, 100%': { opacity: 0.6 },
            '50%': { opacity: 1 },
          },
        }}
      >
        {message}
      </Typography>

      {/* Progress dots */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mt: 1,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'primary.main',
              animation: `bounce 1.4s ease-in-out infinite ${index * 0.2}s`,
              '@keyframes bounce': {
                '0%, 80%, 100%': { 
                  transform: 'scale(0.8)',
                  opacity: 0.5,
                },
                '40%': { 
                  transform: 'scale(1)',
                  opacity: 1,
                },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ModernLoadingSpinner; 