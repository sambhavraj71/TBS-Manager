import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getActivities } from '../services/api';


const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth(); // Changed from isAdmin to user

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await getActivities();
      setActivities(response.data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'success';
      case 'update': return 'info';
      case 'delete': return 'error';
      case 'login': return 'primary';
      case 'logout': return 'secondary';
      default: return 'default';
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.entityType === filter);

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Activity Log</Typography>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter by Type"
            size="small"
          >
            <MenuItem value="all">All Activities</MenuItem>
            <MenuItem value="client">Client Activities</MenuItem>
            <MenuItem value="project">Project Activities</MenuItem>
            <MenuItem value="user">User Activities</MenuItem>
            <MenuItem value="system">System Activities</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredActivities.map((activity) => (
              <TableRow key={activity._id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {activity.user?.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {activity.user?.email}
                      {activity.user?.role === 'admin' && (
                        <Chip label="Admin" size="small" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={activity.action}
                    color={getActionColor(activity.action)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={activity.entityType}
                    variant="outlined"
                    size="small"
                  />
                  {activity.entityName && (
                    <Typography variant="caption" display="block">
                      {activity.entityName}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{activity.details}</TableCell>
                <TableCell>
                  <Typography variant="caption" fontFamily="monospace">
                    {activity.ipAddress}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(activity.timestamp).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Activities;