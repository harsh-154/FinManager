import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';

const billCategories = [
  'Rent', 'Mortgage', 'Utilities', 'Internet', 'Phone',
  'Insurance', 'Loan', 'Subscription', 'Credit Card', 'Other'
];

function BillForm() {
  const { addBill, financeError } = useFinance();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [category, setCategory] = useState(billCategories[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    if (!name.trim()) {
      alert('Please enter a bill name.');
      setLoading(false);
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Please enter a valid positive amount.');
      setLoading(false);
      return;
    }
    if (!dueDate) {
      alert('Please select a due date.');
      setLoading(false);
      return;
    }

    const dueDateObj = new Date(dueDate); // Convert date string to Date object

    const successAdd = await addBill(
      name.trim(),
      parseFloat(amount),
      dueDateObj,
      isRecurring,
      category
    );

    if (successAdd) {
      setSuccess('Bill added successfully!');
      setName('');
      setAmount('');
      setDueDate('');
      setIsRecurring(false);
      setCategory(billCategories[0]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Bill</h2>
      {financeError && <p className="text-red-500 mb-4">{financeError}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="billName" className="block text-sm font-medium text-gray-700">Bill Name</label>
          <input
            type="text"
            id="billName"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            placeholder="e.g., Electricity Bill"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="billAmount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            id="billAmount"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            placeholder="e.g., 1500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            id="dueDate"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {billCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center">
          <input
            id="isRecurring"
            name="isRecurring"
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-900">
            Is Recurring Bill?
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          {loading ? 'Adding...' : 'Add Bill'}
        </button>
      </form>
    </div>
  );
}

export default BillForm;