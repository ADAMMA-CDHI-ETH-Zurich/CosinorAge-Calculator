import React from 'react';
import { Button, Box } from '@mui/material';

const ModernButton = ({ 
  children, 
  variant = 'contained',
  size = 'medium',
  sx = {},
  glowEffect = true,
  rippleEffect = true,
  ...props 
}) => {
  const baseStyles = {
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: size === 'large' ? '12px 24px' : size === 'small' ? '8px 16px' : '10px 20px',
    minHeight: size === 'large' ? '48px' : size === 'small' ? '36px' : '44px',
    letterSpacing: '0.02em',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    ...sx,
  };

  const glowStyles = glowEffect ? {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      transition: 'left 0.5s',
    },
    '&:hover::before': {
      left: '100%',
    },
  } : {};

  const rippleStyles = rippleEffect ? {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '0',
      height: '0',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.3)',
      transform: 'translate(-50%, -50%)',
      transition: 'width 0.6s, height 0.6s',
    },
    '&:active::after': {
      width: '300px',
      height: '300px',
    },
  } : {};

  const variantStyles = {
    contained: {
      background: 'linear-gradient(135deg, #0066CC 0%, #3385D6 100%)',
      color: 'white',
      boxShadow: '0 4px 14px rgba(0, 102, 204, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #0052A3 0%, #2B6BC7 100%)',
        boxShadow: '0 6px 20px rgba(0, 102, 204, 0.4)',
        transform: 'translateY(-2px)',
      },
    },
    outlined: {
      border: '2px solid #0066CC',
      color: '#0066CC',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      '&:hover': {
        background: 'rgba(0, 102, 204, 0.1)',
        borderColor: '#0052A3',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 102, 204, 0.2)',
      },
    },
    text: {
      color: '#0066CC',
      background: 'transparent',
      '&:hover': {
        background: 'rgba(0, 102, 204, 0.1)',
        transform: 'translateY(-1px)',
      },
    },
  };

  return (
    <Button
      variant={variant}
      size={size}
      sx={{
        ...baseStyles,
        ...glowStyles,
        ...rippleStyles,
        ...variantStyles[variant],
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ModernButton; 