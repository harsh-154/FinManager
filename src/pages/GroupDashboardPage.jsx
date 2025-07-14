import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSplitwise } from '../contexts/SplitwiseContext';
import CreateGroupForm from '../components/splitwise/CreateGroupForm';
import GroupList from '../components/splitwise/GroupList';
import { UserGroupIcon } from '@heroicons/react/24/outline';

function GroupDashboardPage() {
  const { currentUser, loading: authLoading, authError } = useAuth();
  const { groups, loadingGroups, splitwiseError } = useSplitwise();

  useEffect(() => {
    console.log("--- GroupDashboardPage Rendered ---");
    console.log("Auth Loading:", authLoading);
    console.log("Current User (UID):", currentUser ? currentUser.uid : "None");
    console.log("Current User (Display Name):", currentUser ? currentUser.displayName : "None");
    console.log("Auth Error:", authError);
    console.log("Splitwise Loading Groups:", loadingGroups);
    console.log("Splitwise Groups Count:", groups ? groups.length : "Not available");
    console.log("Splitwise Error:", splitwiseError);
    console.log("---------------------------------");
  }, [authLoading, currentUser, authError, loadingGroups, groups, splitwiseError]);


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <p className="text-lg font-medium text-gray-700">Loading groups dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center">
          <p className="text-red-600 text-lg font-semibold">Authentication required to view groups.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8 bg-white/80 shadow rounded-lg px-6 py-5">
          <span className="material-icons text-blue-500 text-4xl">groups</span>
          <h1 className="text-3xl font-extrabold text-gray-900">Your Groups</h1>
        </div>

        {/* Error Messages */}
        {authError && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {authError}
          </div>
        )}
        {splitwiseError && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {splitwiseError}
          </div>
        )}

        {/* Create New Group Form Card */}
        <div className="bg-white shadow rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="material-icons text-green-500">add_circle</span>
            Create a New Group
          </h2>
          <CreateGroupForm />
        </div>

        {/* Group List Card */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="material-icons text-purple-500">list_alt</span>
            Group List
          </h2>
          <GroupList />
        </div>
      </div>
    </div>
  );
}

export default GroupDashboardPage;