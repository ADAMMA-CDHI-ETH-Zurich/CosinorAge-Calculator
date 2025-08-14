import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

const ModernProgress = ({ 
  value = 0, 
  max = 100, 
  label, 
  variant = 'linear',
  size = 'medium',
  showPercentage = true,
  animated = true,
  sx = {} 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeMap = {
    small: { height: 6, fontSize: '0.75rem' },
    medium: { height: 8, fontSize: '0.875rem' },
    large: { height: 12, fontSize: '1rem' }
  };

  const currentSize = sizeMap[size];

  const linearVariant = (
    <Box sx={{ width: '100%', position: 'relative', ...sx }}>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: currentSize.height,
          borderRadius: currentSize.height / 2,
          backgroundColor: 'rgba(0, 102, 204, 0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: currentSize.height / 2,
            background: animated 
              ? 'linear-gradient(90deg, #0066CC, #3385D6, #0066CC)'
              : 'linear-gradient(90deg, #0066CC, #3385D6)',
            backgroundSize: animated ? '200% 100%' : '100% 100%',
            animation: animated ? 'gradientMove 2s ease-in-out infinite' : 'none',
            '@keyframes gradientMove': {
              '0%, 100%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
            },
            boxShadow: '0 2px 8px rgba(0, 102, 204, 0.3)',
          },
        }}
      />
      {(label || showPercentage) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1,
          }}
        >
          {label && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: currentSize.fontSize,
                fontWeight: 500,
              }}
            >
              {label}
            </Typography>
          )}
          {showPercentage && (
            <Typography
              variant="body2"
              sx={{
                color: 'primary.main',
                fontSize: currentSize.fontSize,
                fontWeight: 600,
                ml: label ? 'auto' : 0,
              }}
            >
              {Math.round(percentage)}%
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );

  const circularVariant = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        ...sx,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: size === 'large' ? 120 : size === 'small' ? 80 : 100,
          height: size === 'large' ? 120 : size === 'small' ? 80 : 100,
        }}
      >
        {/* Background circle */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, rgba(0, 102, 204, 0.1) 0deg, rgba(0, 102, 204, 0.1) 360deg)',
          }}
        />
        
        {/* Progress circle */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            background: `conic-gradient(from -90deg, #0066CC 0deg, #3385D6 ${percentage * 3.6}deg, rgba(0, 102, 204, 0.1) ${percentage * 3.6}deg)`,
            transition: 'all 0.5s ease-in-out',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '80%',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
        
        {/* Center content */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          {showPercentage && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                fontSize: size === 'large' ? '1.5rem' : size === 'small' ? '1rem' : '1.25rem',
              }}
            >
              {Math.round(percentage)}%
            </Typography>
          )}
          {label && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: size === 'large' ? '0.875rem' : '0.75rem',
                fontWeight: 500,
                mt: 0.5,
              }}
            >
              {label}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );

  return variant === 'circular' ? circularVariant : linearVariant;
};

export default ModernProgress; 