import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailsPage from './pages/GroupDetailsPage';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <PrivateRoute>
              <GroupsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/groups/:groupId"
          element={
            <PrivateRoute>
              <GroupDetailsPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-gray-100 text-2xl font-bold">404 - Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;