import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';

// Example categories for dropdown
const categories = [
  'Food', 'Transport', 'Housing', 'Utilities', 'Entertainment',
  'Shopping', 'Health', 'Education', 'Salary', 'Other'
];

function ExpenseForm() {
  const { addExpense, financeError } = useFinance();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
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
    if (!category.trim()) {
      alert('Please select or enter a category.');
      setLoading(false);
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description.');
      setLoading(false);
      return;
    }

    const successAdd = await addExpense(parseFloat(amount), category.trim(), description.trim());
    if (successAdd) {
      setSuccess('Expense added successfully!');
      setAmount('');
      setCategory(categories[0]);
      setDescription('');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Expense</h2>
      {financeError && <p className="text-red-500 mb-4">{financeError}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            id="amount"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., 500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            id="description"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Groceries for the week"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;