import React, { useState } from 'react';
import { useSplitwise } from '../../contexts/SplitwiseContext';

function GroupForm() {
  const { createGroup, splitwiseError } = useSplitwise();
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    if (!groupName.trim()) {
      alert('Please enter a group name.');
      setLoading(false);
      return;
    }

    const newGroupId = await createGroup(groupName.trim());
    if (newGroupId) {
      setSuccess('Group created successfully!');
      setGroupName('');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Group</h2>
      {splitwiseError && <p className="text-red-500 mb-4">{splitwiseError}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
            id="groupName"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="e.g., Vacation with Friends"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
}

export default GroupForm;