import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';

function ExpenseList() {
  const { expenses, loadingExpenses, financeError, deleteFinanceItem } = useFinance();

  if (loadingExpenses) {
    return <div className="text-center py-4">Loading expenses...</div>;
  }

  if (financeError) {
    return <div className="text-red-500 text-center py-4">Error: {financeError}</div>;
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      await deleteFinanceItem('expenses', id);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Expenses</h2>
      {expenses.length === 0 ? (
        <p className="text-gray-600">No expenses recorded yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {expenses.map((expense) => (
            <li key={expense.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="text-lg font-medium text-gray-900">{expense.description}</p>
                <p className="text-sm text-gray-500">{expense.category} - {expense.date.toLocaleDateString()}</p>
              </div>
              <div className="flex items-center">
                <p className="text-lg font-bold text-red-600 mr-4">₹{expense.amount.toLocaleString('en-IN')}</p>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  title="Delete Expense"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ExpenseList;