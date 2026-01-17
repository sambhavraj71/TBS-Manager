import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { fetchProjects, fetchClients, getActivities } from '../services/api';
import { Link } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalClients: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingProjects: 0,
  });
  const [myProjects, setMyProjects] = useState([]);
  const [myClients, setMyClients] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Fetch all data
      const [projectsRes, clientsRes, activitiesRes] = await Promise.all([
        fetchProjects(),
        fetchClients(),
        getActivities()
      ]);

      let projects = projectsRes.data || [];
      let clients = clientsRes.data || [];
      let activities = activitiesRes.data || [];

      // Filter data based on user role
      if (!isAdmin) {
        // Employee can only see their own data
        projects = projects.filter(project => project.createdBy === user?.id);
        clients = clients.filter(client => client.createdBy === user?.id);
        activities = activities.filter(activity => activity.user?._id === user?.id);
      }

      // Calculate stats
      const activeProjects = projects.filter(p => p.status === 'in-progress').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const pendingProjects = projects.filter(p => p.status === 'pending').length;

      setStats({
        totalProjects: projects.length,
        totalClients: clients.length,
        activeProjects,
        completedProjects,
        pendingProjects,
      });

      // Get my recent projects (created by me or all if admin)
      const sortedProjects = [...projects]
        .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
        .slice(0, 5);
      setMyProjects(sortedProjects);

      // Get my recent clients
      const sortedClients = [...clients]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setMyClients(sortedClients);

      // Get recent activities
      const sortedActivities = [...activities]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
      setRecentActivities(sortedActivities);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'pending': return 'warning';
      case 'on-hold': return 'error';
      default: return 'default';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'success';
      case 'update': return 'info';
      case 'delete': return 'error';
      case 'login': return 'primary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.name}!
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {isAdmin ? 'Administrator Dashboard' : 'Employee Dashboard'}
            {!isAdmin && ' - You can only see your own data'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            component={Link}
            to="/clients/new"
            startIcon={<AddIcon />}
          >
            Add Client
          </Button>
          <Button
            variant="contained"
            component={Link}
            to="/projects/new"
            startIcon={<AddIcon />}
          >
            Add Project
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Projects
              </Typography>
              <Typography variant="h3" color="primary">
                {stats.totalProjects}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Projects
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip label={`${stats.activeProjects} Active`} size="small" color="primary" variant="outlined" />
                <Chip label={`${stats.completedProjects} Done`} size="small" color="success" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Clients
              </Typography>
              <Typography variant="h3" color="secondary">
                {stats.totalClients}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Clients
              </Typography>
              <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                {isAdmin ? 'All company clients' : 'Clients assigned to you'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Work
              </Typography>
              <Typography variant="h3" color="info.main">
                {stats.activeProjects}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Projects in Progress
              </Typography>
              <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                Currently working on
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h3" color="warning.main">
                {stats.pendingProjects}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Projects Pending
              </Typography>
              <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                Awaiting start
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Projects and Clients */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                My Recent Projects
              </Typography>
              <Button component={Link} to="/projects" size="small">
                View All
              </Button>
            </Box>
            
            {myProjects.length === 0 ? (
              <Box textAlign="center" py={3}>
                <Typography color="textSecondary">
                  No projects found. {!isAdmin && 'Add your first project!'}
                </Typography>
                {!isAdmin && (
                  <Button
                    component={Link}
                    to="/projects/new"
                    variant="outlined"
                    sx={{ mt: 2 }}
                  >
                    Create First Project
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myProjects.map((project) => (
                      <TableRow 
                        key={project._id}
                        hover
                        component={Link}
                        to={`/projects/edit/${project._id}`}
                        sx={{ textDecoration: 'none', cursor: 'pointer' }}
                      >
                        <TableCell>{project.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={project.status}
                            size="small"
                            color={getStatusColor(project.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={project.projectType}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                My Recent Clients
              </Typography>
              <Button component={Link} to="/clients" size="small">
                View All
              </Button>
            </Box>
            
            {myClients.length === 0 ? (
              <Box textAlign="center" py={3}>
                <Typography color="textSecondary">
                  No clients found. {!isAdmin && 'Add your first client!'}
                </Typography>
                {!isAdmin && (
                  <Button
                    component={Link}
                    to="/clients/new"
                    variant="outlined"
                    sx={{ mt: 2 }}
                  >
                    Add First Client
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Client Name</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myClients.map((client) => (
                      <TableRow 
                        key={client._id}
                        hover
                        component={Link}
                        to={`/clients/edit/${client._id}`}
                        sx={{ textDecoration: 'none', cursor: 'pointer' }}
                      >
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.company || 'Individual'}</TableCell>
                        <TableCell>
                          <Chip
                            label={client.clientType}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Recent Activities
          </Typography>
          <Button component={Link} to="/activities" size="small">
            View All Activities
          </Button>
        </Box>
        
        {recentActivities.length === 0 ? (
          <Box textAlign="center" py={3}>
            <Typography color="textSecondary">
              No activities recorded yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentActivities.map((activity) => (
                  <TableRow key={activity._id}>
                    <TableCell>
                      <Chip
                        label={activity.action}
                        size="small"
                        color={getActionColor(activity.action)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={activity.entityType}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{activity.details}</TableCell>
                    <TableCell>
                      {new Date(activity.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;