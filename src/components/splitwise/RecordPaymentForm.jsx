import React, { useState } from 'react';
import { useSplitwise } from '../../contexts/SplitwiseContext';

function RecordPaymentForm({ groupId, groupMembers, groupMembersDetails }) {
  const { recordPayment, splitwiseError } = useSplitwise();
  const [payer, setPayer] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Filter members to ensure both payer and receiver are selected and are different
  const availableMembers = groupMembers.filter(uid => groupMembersDetails[uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!payer || !receiver || !amount) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
    if (payer === receiver) {
      setError('Payer and receiver cannot be the same person.');
      setLoading(false);
      return;
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid positive amount.');
      setLoading(false);
      return;
    }

    const success = await recordPayment(groupId, payer, receiver, parseFloat(amount));

    if (success) {
      setSuccess(`Successfully recorded payment of ₹${parseFloat(amount).toFixed(2)} from ${groupMembersDetails[payer]} to ${groupMembersDetails[receiver]}!`);
      setPayer('');
      setReceiver('');
      setAmount('');
    } else {
      setError(splitwiseError || 'Failed to record payment. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Record a Payment</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="payer" className="block text-sm font-medium text-gray-700">Who paid?</label>
          <select
            id="payer"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            required
          >
            <option value="">Select Payer</option>
            {availableMembers.map((memberId) => (
              <option key={memberId} value={memberId}>
                {groupMembersDetails[memberId]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="receiver" className="block text-sm font-medium text-gray-700">Who received?</label>
          <select
            id="receiver"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            required
          >
            <option value="">Select Receiver</option>
            {availableMembers.map((memberId) => (
              <option key={memberId} value={memberId}>
                {groupMembersDetails[memberId]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            id="amount"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {loading ? 'Recording...' : 'Record Payment'}
        </button>
      </form>
    </div>
  );
}

export default RecordPaymentForm;