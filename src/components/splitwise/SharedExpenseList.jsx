import React from 'react';
import { useSplitwise } from '../../contexts/SplitwiseContext';

function SharedExpenseList({ groupMembersDetails }) {
  const { currentGroupExpenses, loadingCurrentGroupExpenses, splitwiseError, deleteSharedExpense } = useSplitwise();

  if (loadingCurrentGroupExpenses) {
    return <div className="text-center py-4">Loading shared expenses...</div>;
  }

  if (splitwiseError) {
    return <div className="text-red-500 text-center py-4">Error: {splitwiseError}</div>;
  }

  const handleDelete = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this shared expense?")) {
      await deleteSharedExpense(expenseId);
    }
  };

  const getMemberName = (uid) => groupMembersDetails[uid] || `User-${uid.substring(0, 4)}`;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Shared Expenses</h2>
      {currentGroupExpenses.length === 0 ? (
        <p className="text-gray-600">No shared expenses recorded yet for this group.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {currentGroupExpenses.map((expense) => (
            <li key={expense.id} className="py-3 flex justify-between items-start">
              <div>
                <p className="text-lg font-medium text-gray-900">{expense.description}</p>
                <p className="text-sm text-gray-600">Paid by: <span className="font-semibold">{getMemberName(expense.paidBy)}</span></p>
                <p className="text-sm text-gray-500">
                  Split between: {expense.participants.map(getMemberName).join(', ')}
                </p>
                {expense.splitMethod === 'exact' && (
                  <div className="text-xs text-gray-500 mt-1">
                    (Exact amounts: {Object.entries(expense.exactAmounts)
                      .map(([uid, amount]) => `${getMemberName(uid)}: ₹${amount.toLocaleString('en-IN')}`)
                      .join(', ')})
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <p className="text-lg font-bold text-teal-600 mr-4">₹{expense.amount.toLocaleString('en-IN')}</p>
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

export default SharedExpenseList;