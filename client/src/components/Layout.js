import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Home,
  People,
  Work,
  History,
  Person,
  AdminPanelSettings,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TBS-Manager
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button color="inherit" component={Link} to="/">
              <Home sx={{ mr: 1 }} /> Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/clients">
              <People sx={{ mr: 1 }} /> Clients
            </Button>
            <Button color="inherit" component={Link} to="/projects">
              <Work sx={{ mr: 1 }} /> Projects
            </Button>
            <Button color="inherit" component={Link} to="/activities">
              <History sx={{ mr: 1 }} /> Activities
            </Button>
            
            {isAdmin && (
              <Button color="inherit" component={Link} to="/users">
                <AdminPanelSettings sx={{ mr: 1 }} /> Users
              </Button>
            )}

            <IconButton onClick={handleMenu} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                <Person sx={{ mr: 2 }} /> Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 2 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Outlet />
      </Container>
    </>
  );
};

export default Layout;