import React from 'react';
import GroupForm from '../components/splitwise/GroupForm';
import GroupList from '../components/splitwise/GroupList';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function GroupsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Groups</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GroupForm />
          <GroupList />
        </div>
      </div>
    </div>
  );
}

export default GroupsPage;