import React from 'react';
import { useSplitwise } from '../../contexts/SplitwiseContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // To check if current user created the group

function GroupList() {
  const { groups, loadingGroups, splitwiseError, deleteGroup, groupMembersDetails } = useSplitwise();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to delete this group and all its expenses? This action cannot be undone.")) {
      const success = await deleteGroup(groupId);
      if (success) {
        console.log("Group deleted successfully!");
        // Optionally, show a success message to the user
      } else {
        console.error("Failed to delete group:", splitwiseError);
        // Optionally, show an error message to the user
      }
    }
  };

  if (loadingGroups) {
    return <p className="text-center text-gray-600">Loading groups...</p>;
  }

  if (splitwiseError) {
    return <p className="text-red-500 text-center">Error fetching groups: {splitwiseError}</p>;
  }

  if (!groups || groups.length === 0) {
    return <p className="text-center text-gray-600">No groups found. Create one above!</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Groups ({groups.length})</h2>
      <ul className="space-y-4">
        {groups.map((group) => (
          <li
            key={group.id}
            className="bg-gray-50 p-4 rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div className="mb-2 sm:mb-0">
              <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-600">
                Members: {group.members ? group.members.length : '0'}
              </p>
              <p className="text-sm text-gray-500">
                Created By: {groupMembersDetails[group.createdBy] || 'Unknown'} on {group.createdAt ? group.createdAt.toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="flex space-x-2 flex-wrap gap-2 sm:gap-0">
              <button
                onClick={() => navigate(`/group/${group.id}`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm"
              >
                View Details
              </button>
              {/* Only allow creator to delete the group */}
              {currentUser && group.createdBy === currentUser.uid && (
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupList;