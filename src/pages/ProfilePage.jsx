import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
  const { currentUser, loading: authLoading, authError, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileUpdateMessage, setProfileUpdateMessage] = useState('');
  const [profileUpdateError, setProfileUpdateError] = useState(null);

  // Sync local displayName state with currentUser's displayName when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || currentUser.email.split('@')[0]);
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileUpdateMessage('');
    setProfileUpdateError(null);

    if (!currentUser) {
        setProfileUpdateError('No user logged in.');
        return;
    }

    if (displayName.trim() === '') {
        setProfileUpdateError('Display name cannot be empty.');
        return;
    }

    const success = await updateUserProfile(currentUser.uid, { displayName: displayName.trim() });
    if (success) {
      setProfileUpdateMessage('Profile updated successfully!');
      setIsEditingProfile(false); // Exit editing mode
    } else {
      setProfileUpdateError(authError || 'Failed to update profile.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500">Authentication required to view profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Profile Settings</h1>

        {authError && <p className="text-red-500 text-center mt-4">{authError}</p>}

        {/* User Info & Profile Settings Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Current User: {currentUser?.displayName || currentUser?.email}
          </h2>
          {!isEditingProfile ? (
            <div className="flex items-center justify-between">
                <p className="text-gray-700">Display Name: <span className="font-medium">{currentUser?.displayName || 'Not set'}</span></p>
                <button
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded focus:outline-none focus:shadow-outline"
                >
                    Edit Display Name
                </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                        New Display Name
                    </label>
                    <input
                        type="text"
                        id="displayName"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                    />
                </div>
                {profileUpdateMessage && <p className="text-green-600 text-sm">{profileUpdateMessage}</p>}
                {profileUpdateError && <p className="text-red-500 text-sm">{profileUpdateError}</p>}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => {
                            setIsEditingProfile(false);
                            setDisplayName(currentUser?.displayName || currentUser?.email.split('@')[0]);
                            setProfileUpdateError(null);
                            setProfileUpdateMessage('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;