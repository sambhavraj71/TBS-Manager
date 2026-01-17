import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Avatar,
  Divider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to change password' });
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                fontSize: 40,
                bgcolor: 'primary.main',
                mx: 'auto',
                mb: 2,
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="h6">{user?.name}</Typography>
            <Typography color="textSecondary">{user?.email}</Typography>
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              {user?.role?.toUpperCase()}
            </Typography>
            {user?.employeeId && (
              <Typography variant="body2" color="textSecondary">
                Employee ID: {user.employeeId}
              </Typography>
            )}
            {user?.department && (
              <Typography variant="body2" color="textSecondary">
                Department: {user.department}
              </Typography>
            )}
            {user?.position && (
              <Typography variant="body2" color="textSecondary">
                Position: {user.position}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {message.text && (
              <Alert severity={message.type} sx={{ mb: 2 }}>
                {message.text}
              </Alert>
            )}

            <form onSubmit={handlePasswordChange}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                margin="normal"
                required
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2 }}
              >
                Change Password
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;