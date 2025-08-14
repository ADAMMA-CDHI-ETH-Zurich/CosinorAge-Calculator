import React from 'react';
import { Card, Box } from '@mui/material';

const ModernCard = ({ 
  children, 
  elevation = 0, 
  sx = {}, 
  hoverEffect = true,
  glassmorphism = true,
  borderRadius = '20px',
  ...props 
}) => {
  const baseStyles = {
    background: glassmorphism 
      ? 'rgba(255, 255, 255, 0.9)' 
      : 'rgba(255, 255, 255, 1)',
    backdropFilter: glassmorphism ? 'blur(20px)' : 'none',
    border: glassmorphism 
      ? '1px solid rgba(255, 255, 255, 0.3)' 
      : '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius,
    position: 'relative',
    overflow: 'hidden',
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    ...sx,
  };

  const hoverStyles = hoverEffect ? {
    "&:hover": {
      transform: "translateY(-8px) scale(1.02)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
      "& .card-shine": {
        transform: "translateX(100%)",
      },
    },
  } : {};

  return (
    <Card
      elevation={elevation}
      sx={{
        ...baseStyles,
        ...hoverStyles,
      }}
      {...props}
    >
      {/* Shine effect on hover */}
      {hoverEffect && (
        <Box
          className="card-shine"
          sx={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            transition: 'transform 0.6s ease-in-out',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {children}
      </Box>
    </Card>
  );
};

export default ModernCard; 