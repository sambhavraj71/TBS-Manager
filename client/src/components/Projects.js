import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, LinearProgress, Chip, MenuItem, Select
} from '@mui/material';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { fetchProjects, deleteProject } from '../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, projectId: null });
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetchProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(deleteDialog.projectId);
      setProjects(projects.filter(project => project._id !== deleteDialog.projectId));
      setDeleteDialog({ open: false, projectId: null });
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const filteredProjects = statusFilter === 'all' 
    ? projects 
    : projects.filter(project => project.status === statusFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'pending': return 'warning';
      case 'on-hold': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button
          variant="contained"
          component={Link}
          to="/projects/new"
          startIcon={<AddIcon />}
        >
          Add New Project
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="in-progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="on-hold">On Hold</MenuItem>
        </Select>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project._id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>
                  <Chip
                    label={project.projectType}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={project.status}
                    size="small"
                    color={getStatusColor(project.status)}
                  />
                </TableCell>
                <TableCell>
                  {project.client?.name || 'No client assigned'}
                </TableCell>
                <TableCell>
                  {new Date(project.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {project.budget ? `$${project.budget}` : 'Not set'}
                </TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/projects/edit/${project._id}`}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialog({ open: true, projectId: project._id })}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, projectId: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this project?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, projectId: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;