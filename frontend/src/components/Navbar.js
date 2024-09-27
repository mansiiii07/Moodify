import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location
  const isMobile = useMediaQuery('(max-width:600px)'); // Check if the screen is mobile size
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Check if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

  // Function to determine if the current route is active
  const isActive = (path) => location.pathname === path;

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  // Toggle the mobile menu
  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  return (
      <AppBar position="static" sx={{ bgcolor: 'white', color: 'black', boxShadow: 3 }}>
        <Toolbar sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? '10px' : '0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <Typography
                variant="h6"
                sx={{
                  flexGrow: 1,
                  cursor: 'pointer',
                  fontFamily: 'Poppins',
                  fontSize: '24px',
                  textAlign: isMobile ? 'center' : 'left',
                  marginTop: isMobile ? '10px' : '0',
                }}
                onClick={() => navigate('/')}
            >
              Moodify
            </Typography>
            {isMobile && (
                <IconButton onClick={toggleMenu}>
                  <MenuIcon />
                </IconButton>
            )}
          </Box>

          {/* Desktop or Mobile Menu Display */}
          <Box
              sx={{
                display: isMobile ? (showMenu ? 'flex' : 'none') : 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                gap: '10px',
                width: isMobile ? '100%' : 'auto',
              }}
          >
            <Button
                color="inherit"
                sx={{
                  marginRight: isMobile ? '0' : '10px',
                  fontFamily: 'Poppins',
                  backgroundColor: isActive('/home') ? '#ff4d4d' : 'transparent',
                  color: isActive('/home') ? 'white' : 'black',
                  width: isMobile ? '100%' : 'auto',
                  '&:hover': {
                    backgroundColor: '#ff4d4d',
                    color: 'white',
                  },
                }}
                onClick={() => navigate('/home')}
            >
              Home
            </Button>
            <Button
                color="inherit"
                sx={{
                  marginRight: isMobile ? '0' : '10px',
                  fontFamily: 'Poppins',
                  backgroundColor: isActive('/profile') ? '#ff4d4d' : 'transparent',
                  color: isActive('/profile') ? 'white' : 'black',
                  width: isMobile ? '100%' : 'auto',
                  '&:hover': {
                    backgroundColor: '#ff4d4d',
                    color: 'white',
                  },
                }}
                onClick={() => navigate('/profile')}
            >
              Profile
            </Button>
            <Button
                color="inherit"
                sx={{
                  marginRight: isMobile ? '0' : '10px',
                  fontFamily: 'Poppins',
                  backgroundColor: isActive('/recommendations') ? '#ff4d4d' : 'transparent',
                  color: isActive('/recommendations') ? 'white' : 'black',
                  width: isMobile ? '100%' : 'auto',
                  '&:hover': {
                    backgroundColor: '#ff4d4d',
                    color: 'white',
                  },
                }}
                onClick={() => navigate('/recommendations')}
            >
              Recommendations
            </Button>
            {isLoggedIn ? (
                <Button
                    color="error"
                    sx={{
                      marginRight: isMobile ? '0' : '10px',
                      fontFamily: 'Poppins',
                      width: isMobile ? '100%' : 'auto',
                      '&:hover': {
                        backgroundColor: '#ff4d4d',
                        color: 'white',
                      },
                    }}
                    onClick={handleLogout}
                >
                  Logout
                </Button>
            ) : (
                <Button
                    color="primary"
                    sx={{
                      marginRight: isMobile ? '0' : '10px',
                      fontFamily: 'Poppins',
                      width: isMobile ? '100%' : 'auto',
                      '&:hover': {
                        backgroundColor: '#ff4d4d',
                        color: 'white',
                      },
                    }}
                    onClick={() => navigate('/login')}
                >
                  Login
                </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
  );
};

export default Navbar;
