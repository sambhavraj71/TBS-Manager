import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Projects from './components/Projects';
import ClientForm from './components/ClientForm';
import ProjectForm from './components/ProjectForm';
import Activities from './components/Activities';
import Profile from './components/Profile';

// Placeholder components
const Users = () => <div>Users Management (Coming Soon)</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/new" element={<ClientForm />} />
            <Route path="clients/edit/:id" element={<ClientForm />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/new" element={<ProjectForm />} />
            <Route path="projects/edit/:id" element={<ProjectForm />} />
            <Route path="users" element={
              <PrivateRoute adminOnly>
                <Users />
              </PrivateRoute>
            } />
            <Route path="activities" element={<Activities />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;