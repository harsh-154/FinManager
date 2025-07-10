import React, { useState, useEffect } from 'react';
import { useSplitwise } from '../../contexts/SplitwiseContext';
import { useAuth } from '../../contexts/AuthContext';

function SharedExpenseForm({ groupId, groupMembers, groupMembersDetails }) {
  const { addSharedExpense, splitwiseError } = useSplitwise();
  const { currentUser } = useAuth();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser ? currentUser.uid : '');
  const [participants, setParticipants] = useState([]);
  const [splitMethod, setSplitMethod] = useState('equal'); // 'equal', 'exact'
  const [exactAmounts, setExactAmounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // When groupMembers change, set all as participants by default
    if (groupMembers) {
      setParticipants(groupMembers);
      // Initialize exact amounts for all members to 0 or calculate equally
      const initialExactAmounts = {};
      groupMembers.forEach(memberId => {
        initialExactAmounts[memberId] = ''; // Empty for user input
      });
      setExactAmounts(initialExactAmounts);
    }
  }, [groupMembers]);

  useEffect(() => {
    // If split method is 'equal' and amount is set, update exact amounts
    if (splitMethod === 'equal' && amount > 0 && participants.length > 0) {
      const perPerson = (parseFloat(amount) / participants.length).toFixed(2);
      const newExactAmounts = {};
      participants.forEach(memberId => {
        newExactAmounts[memberId] = perPerson;
      });
      setExactAmounts(newExactAmounts);
    }
  }, [splitMethod, amount, participants]);


  const handleParticipantChange = (memberId) => {
    setParticipants(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleExactAmountChange = (memberId, value) => {
    setExactAmounts(prev => ({
      ...prev,
      [memberId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    if (!description.trim() || !amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Please enter a valid description and positive amount.');
      setLoading(false);
      return;
    }
    if (!paidBy) {
      alert('Please select who paid.');
      setLoading(false);
      return;
    }
    if (participants.length === 0) {
      alert('Please select at least one participant.');
      setLoading(false);
      return;
    }

    let finalExactAmounts = {};
    if (splitMethod === 'exact') {
      let sumExact = 0;
      let hasInvalidExactAmount = false;
      for (const memberId of participants) {
        const val = parseFloat(exactAmounts[memberId]);
        if (isNaN(val) || val < 0) {
          hasInvalidExactAmount = true;
          break;
        }
        finalExactAmounts[memberId] = val;
        sumExact += val;
      }

      if (hasInvalidExactAmount) {
        alert('Please enter valid non-negative exact amounts for all selected participants.');
        setLoading(false);
        return;
      }
      if (Math.abs(sumExact - parseFloat(amount)) > 0.01) { // Allow for floating point inaccuracies
        alert(`Exact amounts (${sumExact.toFixed(2)}) do not sum up to the total amount (${parseFloat(amount).toFixed(2)}).`);
        setLoading(false);
        return;
      }
    }

    const successAdd = await addSharedExpense(
      groupId,
      description.trim(),
      parseFloat(amount),
      paidBy,
      participants,
      splitMethod,
      finalExactAmounts
    );

    if (successAdd) {
      setSuccess('Shared expense added successfully!');
      setDescription('');
      setAmount('');
      setPaidBy(currentUser ? currentUser.uid : ''); // Reset to current user after add
      // Reset participants and exact amounts based on initial group members
      if (groupMembers) {
        setParticipants(groupMembers);
        const initialExactAmounts = {};
        groupMembers.forEach(memberId => {
          initialExactAmounts[memberId] = '';
        });
        setExactAmounts(initialExactAmounts);
      }
      setSplitMethod('equal');
    }
    setLoading(false);
  };

  if (!groupMembers || groupMembers.length === 0) {
    return <p className="text-gray-600 text-center">No group members available to add an expense.</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Shared Expense</h2>
      {splitwiseError && <p className="text-red-500 mb-4">{splitwiseError}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            id="description"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="e.g., Dinner at Cafe"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Total Amount</label>
          <input
            type="number"
            id="amount"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="e.g., 2500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700">Paid By</label>
          <select
            id="paidBy"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            required
          >
            {groupMembers.map((memberId) => (
              <option key={memberId} value={memberId}>
                {groupMembersDetails[memberId] || memberId}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Split Between</label>
          <div className="space-y-2">
            {groupMembers.map((memberId) => (
              <div key={memberId} className="flex items-center">
                <input
                  type="checkbox"
                  id={`participant-${memberId}`}
                  checked={participants.includes(memberId)}
                  onChange={() => handleParticipantChange(memberId)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor={`participant-${memberId}`} className="ml-2 text-sm text-gray-900">
                  {groupMembersDetails[memberId] || memberId}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="splitMethod" className="block text-sm font-medium text-gray-700">Split Method</label>
          <select
            id="splitMethod"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
            value={splitMethod}
            onChange={(e) => setSplitMethod(e.target.value)}
            required
          >
            <option value="equal">Split Equally</option>
            <option value="exact">Split by Exact Amounts</option>
            {/* <option value="percentage">Split by Percentage (Coming Soon)</option> */}
          </select>
        </div>

        {splitMethod === 'exact' && (
          <div className="space-y-2 border p-4 rounded-md bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">Enter Exact Amounts:</p>
            {participants.map((memberId) => (
              <div key={`exact-${memberId}`} className="flex items-center">
                <label htmlFor={`exact-amount-${memberId}`} className="w-1/2 text-sm text-gray-900">
                  {groupMembersDetails[memberId] || memberId}:
                </label>
                <input
                  type="number"
                  id={`exact-amount-${memberId}`}
                  className="ml-2 block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  value={exactAmounts[memberId] || ''}
                  onChange={(e) => handleExactAmountChange(memberId, e.target.value)}
                  placeholder="Amount"
                  step="0.01"
                />
              </div>
            ))}
            <p className="text-sm text-gray-600 mt-2">
              Total of exact amounts: ₹{Object.values(exactAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2)} / ₹{parseFloat(amount).toFixed(2)}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          {loading ? 'Adding Expense...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
}

export default SharedExpenseForm;