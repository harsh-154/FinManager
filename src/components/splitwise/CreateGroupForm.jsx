import React, { useState } from 'react';
import { useSplitwise } from '../../contexts/SplitwiseContext';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth to get current user ID for initial member

function CreateGroupForm() {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { createGroup, splitwiseError } = useSplitwise();
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    if (!currentUser) {
      setSuccessMessage(''); // Clear any previous success message
      setLoading(false);
      return;
    }

    if (!groupName.trim()) {
      setSuccessMessage(''); // Clear any previous success message
      setLoading(false);
      return;
    }

    // Automatically add the current user as an initial member
    const success = await createGroup(groupName, [currentUser.uid]);
    if (success) {
      setGroupName('');
      setSuccessMessage('Group created successfully!');
    } else {
      // Error message is handled by SplitwiseContext and passed to splitwiseError
    }
    setLoading(false);
    // Clear success message after a short delay
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Group</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">
            Group Name
          </label>
          <input
            type="text"
            id="groupName"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="e.g., Trip to Goa, Housemates"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>
        {successMessage && <p className="text-green-600 text-center mt-3">{successMessage}</p>}
        {splitwiseError && <p className="text-red-500 text-center mt-3">{splitwiseError}</p>}
      </form>
    </div>
  );
}

export default CreateGroupForm;