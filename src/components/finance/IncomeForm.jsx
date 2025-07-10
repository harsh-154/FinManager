import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';

function IncomeForm() {
  const { addIncome, financeError } = useFinance();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Please enter a valid positive amount.');
      setLoading(false);
      return;
    }
    if (!source.trim()) {
      alert('Please enter an income source.');
      setLoading(false);
      return;
    }

    const successAdd = await addIncome(parseFloat(amount), source.trim());
    if (successAdd) {
      setSuccess('Income added successfully!');
      setAmount('');
      setSource('');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Income</h2>
      {financeError && <p className="text-red-500 mb-4">{financeError}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            id="amount"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label>
          <input
            type="text"
            id="source"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Salary, Freelance"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? 'Adding...' : 'Add Income'}
        </button>
      </form>
    </div>
  );
}

export default IncomeForm;