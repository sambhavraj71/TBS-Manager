import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Paper,
  MenuItem, Grid, LinearProgress, Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchClient, createClient, updateClient } from '../services/api';

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    address: '',
    clientType: 'individual',
  });

  const clientTypes = [
    { value: 'individual', label: 'Individual' },
    { value: 'startup', label: 'Startup' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'agency', label: 'Agency' },
  ];

  useEffect(() => {
    if (id) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      const response = await fetchClient(id);
      setFormData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading client:', error);
      setError('Failed to load client data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (id) {
        await updateClient(id, formData);
        setSuccess('Client updated successfully!');
      } else {
        await createClient(formData);
        setSuccess('Client created successfully!');
      }
      
      setTimeout(() => {
        navigate('/clients');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Something went wrong');
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {id ? 'Edit Client' : 'Add New Client'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Client Type"
              name="clientType"
              value={formData.clientType}
              onChange={handleChange}
            >
              {clientTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              multiline
              rows={2}
              value={formData.address}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                {id ? 'Update Client' : 'Create Client'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/clients')}
              >
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ClientForm;