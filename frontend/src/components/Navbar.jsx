// Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Box, Typography, Button } from '@mui/material';
import { SignedOut, SignedIn, UserButton, useUser } from '@clerk/clerk-react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isSignedIn } = useUser();

  const NAV_LINKS = [
    { label: 'FEED', path: '/' },
    { label: 'WRITE A REVIEW', path: '/create' },
    { label: 'DASHBOARD', path: isSignedIn ? '/dashboard' : '/sign-in' },
  ];

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button
                sx={{
                  color: 'black', 
                  textTransform: 'none',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 'bold'
                }}
              >
                <img src="/book.png" alt="icon png" width={25} style={{ marginRight: '10px' }}/>
                ReadUP
              </Button>
            </Link>
          </Typography>
        </Box>

        {/* Navigation Links */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {NAV_LINKS.map((link) => (
              <Link key={link.label} to={link.path} style={{ textDecoration: 'none' }}>
                <Button sx={{ color: 'black' }}>{link.label}</Button>
              </Link>
            ))}
          </Box>
        )}

        {/* Sign In / Sign Out Buttons */}
        <SignedOut>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link to="/sign-up" style={{ textDecoration: 'none' }}>
              <Button sx={{ color: 'black' }}>Sign Up</Button>
            </Link>
            <Link to="/sign-in" style={{ textDecoration: 'none' }}>
              <Button sx={{ color: 'black' }}>Sign In</Button>
            </Link>
          </Box>
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
