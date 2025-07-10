import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import AuthPage from './pages/AuthPage';
import GroupDashboardPage from './pages/GroupDashboardPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import ProfilePage from './pages/ProfilePage';
import PersonalFinancePage from './pages/PersonalFinancePage';
import PrivateLayout from './components/layout/PrivateLayout'; // ✅ Import the layout

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div>Loading user data...</div>;
  return currentUser ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />

        {/* Wrap private routes in layout + auth */}
        <Route
          element={
            <PrivateRoute>
              <PrivateLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<GroupDashboardPage />} />
          <Route path="/group/:groupId" element={<GroupDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/personal-finance" element={<PersonalFinancePage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
