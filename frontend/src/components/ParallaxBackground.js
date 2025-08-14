import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

const ParallaxBackground = ({ children }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -2,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Floating geometric shapes */}
        <Box
          sx={{
            position: 'absolute',
            top: `${20 + scrollY * 0.1}px`,
            left: '10%',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(45deg, rgba(0, 102, 204, 0.1), rgba(0, 102, 204, 0.05))',
            borderRadius: '50%',
            filter: 'blur(1px)',
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(180deg)' },
            },
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            top: `${60 + scrollY * 0.05}px`,
            right: '15%',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(45deg, rgba(26, 26, 26, 0.08), rgba(26, 26, 26, 0.04))',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            filter: 'blur(2px)',
            animation: 'morph 8s ease-in-out infinite',
            '@keyframes morph': {
              '0%, 100%': { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
              '25%': { borderRadius: '58% 42% 75% 25% / 76% 46% 54% 24%' },
              '50%': { borderRadius: '50% 50% 33% 67% / 55% 27% 73% 45%' },
              '75%': { borderRadius: '33% 67% 58% 42% / 63% 68% 32% 37%' },
            },
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            bottom: `${40 - scrollY * 0.08}px`,
            left: '20%',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, rgba(46, 125, 50, 0.1), rgba(46, 125, 50, 0.05))',
            borderRadius: '50%',
            filter: 'blur(1.5px)',
            animation: 'pulse 4s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
              '50%': { transform: 'scale(1.1)', opacity: 1 },
            },
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            top: `${200 + scrollY * 0.12}px`,
            right: '5%',
            width: '120px',
            height: '120px',
            background: 'linear-gradient(45deg, rgba(211, 47, 47, 0.08), rgba(211, 47, 47, 0.04))',
            borderRadius: '50%',
            filter: 'blur(2px)',
            animation: 'float 7s ease-in-out infinite reverse',
          }}
        />
        
        {/* Grid pattern overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            opacity: 0.3,
            transform: `translateY(${scrollY * 0.02}px)`,
          }}
        />
        
        {/* Gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(0, 102, 204, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(46, 125, 50, 0.05) 0%, transparent 50%)',
            opacity: 0.8,
          }}
        />
      </Box>
      
      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export default ParallaxBackground; 