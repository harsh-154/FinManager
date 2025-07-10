import React, { useState, useEffect } from 'react';
import { useSplitwise } from '../../contexts/SplitwiseContext';

// This component will be rendered as a modal or conditional form
function EditSharedExpenseModal({ expense, groupMembers, groupMembersDetails, onClose }) {
  const { updateSharedExpense, splitwiseError } = useSplitwise();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [participants, setParticipants] = useState([]);
  const [splitMethod, setSplitMethod] = useState('equal'); // 'equal' or 'exact'
  const [exactAmounts, setExactAmounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Effect to populate form fields when the expense prop changes (i.e., when modal opens for a specific expense)
  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setPaidBy(expense.paidBy);
      setParticipants(expense.participants || []);
      setSplitMethod(expense.splitMethod || 'equal');
      setExactAmounts(expense.exactAmounts || {});
    }
  }, [expense]);

  const handleParticipantChange = (memberId) => {
    setParticipants((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleExactAmountChange = (memberId, value) => {
    setExactAmounts((prev) => ({
      ...prev,
      [memberId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEditError(null);

    if (!description.trim() || !amount || parseFloat(amount) <= 0 || !paidBy || participants.length === 0) {
      setEditError('Please fill all required fields and ensure amount is positive.');
      setLoading(false);
      return;
    }

    if (splitMethod === 'exact') {
      const totalExact = Object.values(exactAmounts).reduce((sum, val) => sum + parseFloat(val || 0), 0);
      if (Math.abs(totalExact - parseFloat(amount)) > 0.01) { // Allow for small floating point discrepancies
        setEditError('Exact amounts do not sum up to the total amount.');
        setLoading(false);
        return;
      }
    }

    const updatedFields = {
      description,
      amount: parseFloat(amount),
      paidBy,
      participants,
      splitMethod,
      exactAmounts: splitMethod === 'exact' ? exactAmounts : {},
      // You might want to add an 'updatedAt' timestamp here
    };

    const success = await updateSharedExpense(expense.id, updatedFields);
    if (success) {
      onClose(); // Close the modal on success
    } else {
      setEditError(splitwiseError || 'Failed to update expense.');
    }
    setLoading(false);
  };

  if (!expense) {
    return null; // Don't render if no expense is passed (e.g., modal is closed)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Expense</h2>
        {editError && <p className="text-red-500 mb-4">{editError}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              id="edit-description"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              id="edit-amount"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-paidBy" className="block text-sm font-medium text-gray-700">
              Paid By
            </label>
            <select
              id="edit-paidBy"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              required
            >
              <option value="">Select Member</option>
              {groupMembers.map((memberId) => (
                <option key={memberId} value={memberId}>
                  {groupMembersDetails[memberId] || `Loading... ${memberId.substring(0,4)}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participants (Who shared the expense?)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {groupMembers.map((memberId) => (
                <div key={memberId} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`edit-participant-${memberId}`}
                    checked={participants.includes(memberId)}
                    onChange={() => handleParticipantChange(memberId)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`edit-participant-${memberId}`} className="ml-2 text-sm text-gray-900">
                    {groupMembersDetails[memberId] || `Loading... ${memberId.substring(0,4)}`}
                  </label>
                </div>
              ))}
            </div>
            {participants.length === 0 && <p className="text-red-500 text-xs mt-1">At least one participant must be selected.</p>}
          </div>

          <div>
            <label htmlFor="edit-splitMethod" className="block text-sm font-medium text-gray-700">
              Split Method
            </label>
            <select
              id="edit-splitMethod"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={splitMethod}
              onChange={(e) => setSplitMethod(e.target.value)}
            >
              <option value="equal">Equal</option>
              <option value="exact">Exact Amounts</option>
            </select>
          </div>

          {splitMethod === 'exact' && (
            <div className="space-y-2">
              <p className="block text-sm font-medium text-gray-700">Enter Exact Amounts:</p>
              {participants.length > 0 ? (
                <>
                  {participants.map((memberId) => (
                    <div key={`exact-${memberId}`} className="flex items-center">
                      <label htmlFor={`exact-amount-${memberId}`} className="w-1/2 text-sm text-gray-900">
                        {groupMembersDetails[memberId] || `Loading... ${memberId.substring(0,4)}`}:
                      </label>
                      <input
                        type="number"
                        id={`exact-amount-${memberId}`}
                        className="ml-2 block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={exactAmounts[memberId] || ''}
                        onChange={(e) => handleExactAmountChange(memberId, e.target.value)}
                        step="0.01"
                      />
                    </div>
                  ))}
                  <p className="text-sm text-gray-600 mt-2">
                    Total entered: ₹
                    {Object.values(exactAmounts)
                      .reduce((sum, val) => sum + parseFloat(val || 0), 0)
                      .toFixed(2)}{' '}
                    / ₹{parseFloat(amount || 0).toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Select participants first to enter exact amounts.</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Updating...' : 'Update Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSharedExpenseModal;