import React from 'react';
import { useSplitwise } from '../../contexts/SplitwiseContext';
import { useNavigate } from 'react-router-dom';

function GroupList() {
  const { groups, loadingGroups, splitwiseError, deleteGroup } = useSplitwise();
  const navigate = useNavigate();

  if (loadingGroups) {
    return <div className="text-center py-4">Loading groups...</div>;
  }

  if (splitwiseError) {
    return <div className="text-red-500 text-center py-4">Error: {splitwiseError}</div>;
  }

  const handleGroupClick = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  const handleDelete = async (groupId, groupName) => {
    if (window.confirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`)) {
      await deleteGroup(groupId);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Groups</h2>
      {groups.length === 0 ? (
        <p className="text-gray-600">No groups found. Create one to get started!</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {groups.map((group) => (
            <li key={group.id} className="py-3 flex justify-between items-center">
              <div
                className="cursor-pointer hover:text-teal-600 transition-colors duration-200"
                onClick={() => handleGroupClick(group.id)}
              >
                <p className="text-lg font-medium text-gray-900">{group.name}</p>
                <p className="text-sm text-gray-500">{group.members.length} members</p>
              </div>
              <button
                onClick={() => handleDelete(group.id, group.name)}
                className="text-red-500 hover:text-red-700 focus:outline-none"
                title="Delete Group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GroupList;