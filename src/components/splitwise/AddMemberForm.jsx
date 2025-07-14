import React, { useState } from 'react';
import { useSplitwise } from '../../contexts/SplitwiseContext';
import { db } from '../../lib/firebase'; // Import db
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import Firestore query functions

function AddMemberForm({ groupId, groupMembers }) {
  const { addGroupMember, splitwiseError } = useSplitwise();
  const [memberEmail, setMemberEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    if (!memberEmail.trim()) {
      setError('Please enter a member email.');
      setLoading(false);
      return;
    }

    try {
      // 1. Find user's UID by email from 'userProfiles' collection
      const usersRef = collection(db, 'userProfiles');
      const q = query(usersRef, where('email', '==', memberEmail.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('User with this email not found. Please ensure they have signed up.');
        setLoading(false);
        return;
      }

      const userData = querySnapshot.docs[0].data();
      const newMemberUid = userData.uid;

      // 2. Check if member is already in the group
      if (groupMembers.includes(newMemberUid)) {
        setError('This member is already in the group.');
        setLoading(false);
        return;
      }

      // 3. Add member to the group using SplitwiseContext function
      const memberAdded = await addGroupMember(groupId, memberEmail.trim());
      if (memberAdded) {
        setSuccess(`Successfully added ${memberEmail} to the group!`);
        setMemberEmail(''); // Clear the input field
      } else {
        // This error would be set by SplitwiseContext's addGroupMember if something went wrong there
        setError(splitwiseError || 'Failed to add member. Please try again.');
      }
    } catch (err) {
      console.error("Error adding member:", err);
      setError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Member</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700">Member Email</label>
          <input
            type="email"
            id="memberEmail"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="enter@member.email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            required
            aria-label="Member Email"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? 'Adding Member...' : 'Add Member'}
        </button>
      </form>
    </div>
  );
}

export default AddMemberForm;