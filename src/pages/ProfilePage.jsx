import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function stringToInitials(nameOrEmail) {
  if (!nameOrEmail) return '';
  const parts = nameOrEmail.split(/\s+|@/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + (parts[1][0] || ''))?.toUpperCase();
}

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-700 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-500 font-semibold text-lg">Authentication required to view profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-2">
          <span className="material-icons text-blue-500 text-4xl">person</span>
          Profile Settings
        </h1>
        {authError && <p className="text-red-500 text-center mt-4">{authError}</p>}
        {/* Profile Card */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl mb-8 flex flex-col items-center relative">
          {/* Avatar */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile avatar"
                className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-md">
                <span className="material-icons text-white text-5xl">person</span>
              </div>
            )}
          </div>
          <div className="h-12" /> {/* Spacer for avatar */}
          <h2 className="text-2xl font-semibold mb-1 text-gray-800 mt-2">
            {currentUser?.displayName || currentUser?.email}
          </h2>
          <p className="text-gray-500 mb-4 text-sm">{currentUser?.email}</p>
          <hr className="w-full border-gray-200 mb-4" />
          {/* Profile Edit Section */}
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Display Name</h3>
            {!isEditingProfile ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-gray-700 text-base font-medium">{currentUser?.displayName || <span className="italic text-gray-400">Not set</span>}</span>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-4 text-sm rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                >
                  Edit
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4 mt-2">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    New Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 sm:text-base transition"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                {profileUpdateMessage && <p className="text-green-600 text-sm font-medium">{profileUpdateMessage}</p>}
                {profileUpdateError && <p className="text-red-500 text-sm font-medium">{profileUpdateError}</p>}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setDisplayName(currentUser?.displayName || currentUser?.email.split('@')[0]);
                      setProfileUpdateError(null);
                      setProfileUpdateMessage('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition border border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;