import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Paper,
  MenuItem, Grid, LinearProgress, Alert, FormControl,
  InputLabel, Select
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { fetchProject, createProject, updateProject, fetchClients } from '../services/api'; 

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectType: 'web',
    status: 'pending',
    client: '',
    technologies: [],
    startDate: new Date(),
    endDate: null,
    budget: '',
    hourlyRate: '',
    estimatedHours: '',
  });

  const projectTypes = [
    { value: 'web', label: 'Web Development' },
    { value: 'mobile', label: 'Mobile App' },
    { value: 'desktop', label: 'Desktop Application' },
    { value: 'full-stack', label: 'Full Stack' },
  ];

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' },
  ];

  useEffect(() => {
    loadClients();
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadClients = async () => {
    try {
      const response = await fetchClients();
      setClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadProject = async () => {
    try {
      const response = await fetchProject(id);
      const project = response.data;
      setFormData({
        ...project,
        startDate: new Date(project.startDate),
        endDate: project.endDate ? new Date(project.endDate) : null,
        budget: project.budget || '',
        hourlyRate: project.hourlyRate || '',
        estimatedHours: project.estimatedHours || '',
      });
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTechChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      technologies: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const projectData = {
        ...formData,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget ? Number(formData.budget) : undefined,
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
      };

      if (id) {
        await updateProject(id, projectData);
        setSuccess('Project updated successfully!');
      } else {
        await createProject(projectData);
        setSuccess('Project created successfully!');
        setFormData({
          name: '',
          description: '',
          projectType: 'web',
          status: 'pending',
          client: '',
          technologies: [],
          startDate: new Date(),
          endDate: null,
          budget: '',
          hourlyRate: '',
          estimatedHours: '',
        });
      }
      
      setTimeout(() => {
        navigate('/projects');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Something went wrong');
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {id ? 'Edit Project' : 'Add New Project'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Project Type</InputLabel>
              <Select
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                label="Project Type"
              >
                {projectTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Client</InputLabel>
              <Select
                name="client"
                value={formData.client}
                onChange={handleChange}
                label="Client"
              >
                <MenuItem value="">No Client</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    {client.name} {client.company ? `(${client.company})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Technologies (comma separated)"
              name="technologies"
              value={formData.technologies.join(',')}
              onChange={handleTechChange}
              placeholder="React, Node.js, MongoDB, etc."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Start Date
              </Typography>
              <DatePicker
                selected={formData.startDate}
                onChange={(date) => setFormData({...formData, startDate: date})}
                dateFormat="MM/dd/yyyy"
                customInput={<TextField fullWidth />}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                End Date (Optional)
              </Typography>
              <DatePicker
                selected={formData.endDate}
                onChange={(date) => setFormData({...formData, endDate: date})}
                dateFormat="MM/dd/yyyy"
                isClearable
                placeholderText="Select end date"
                customInput={<TextField fullWidth />}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Budget ($)"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Hourly Rate ($)"
              name="hourlyRate"
              type="number"
              value={formData.hourlyRate}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Estimated Hours"
              name="estimatedHours"
              type="number"
              value={formData.estimatedHours}
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
                {id ? 'Update Project' : 'Create Project'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/projects')}
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

export default ProjectForm;