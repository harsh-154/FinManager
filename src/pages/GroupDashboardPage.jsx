import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSplitwise } from '../contexts/SplitwiseContext';
import CreateGroupForm from '../components/splitwise/CreateGroupForm';
import GroupList from '../components/splitwise/GroupList';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading groups dashboard...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500">Authentication required to view groups.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Groups</h1>

        {authError && <p className="text-red-500 text-center mt-4">{authError}</p>}
        {splitwiseError && <p className="text-red-500 text-center mt-4">{splitwiseError}</p>}

        {/* Create New Group Form */}
        <CreateGroupForm />

        {/* Group List */}
        <GroupList />

      </div>
    </div>
  );
}

export default GroupDashboardPage;