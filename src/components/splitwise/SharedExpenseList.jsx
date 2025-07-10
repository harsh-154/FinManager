import React, { useState } from 'react';
import { useSplitwise } from '../../contexts/SplitwiseContext';
import { useAuth } from '../../contexts/AuthContext';

// Add onEditExpense prop
function SharedExpenseList({ groupMembersDetails, onEditExpense }) {
  const { currentGroupExpenses, loadingCurrentGroupExpenses, splitwiseError, deleteSharedExpense } = useSplitwise();
  const { currentUser } = useAuth();
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  if (loadingCurrentGroupExpenses) {
    return <p className="text-center text-gray-600">Loading expenses...</p>;
  }

  if (splitwiseError) {
    return <p className="text-red-500 text-center">Error: {splitwiseError}</p>;
  }

  if (!currentGroupExpenses || currentGroupExpenses.length === 0) {
    return <p className="text-center text-gray-600">No shared expenses yet for this group.</p>;
  }

  const handleDeleteClick = (expenseId) => {
    setDeletingId(expenseId);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const success = await deleteSharedExpense(deletingId);
      if (success) {
        console.log("Expense deleted successfully:", deletingId);
      } else {
        console.error("Failed to delete expense:", deletingId, splitwiseError);
        // Add user feedback for error
      }
      setDeletingId(null);
      setShowConfirm(false);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
    setShowConfirm(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Shared Expenses</h2>
      <div className="space-y-4">
        {currentGroupExpenses.map((expense) => (
          <div key={expense.id} className="border-b pb-3 border-gray-200 last:border-b-0 last:pb-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-medium text-gray-900">{expense.description}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{groupMembersDetails[expense.paidBy] || 'Unknown'}</span> paid ₹{expense.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  For: {expense.participants.map(pId => groupMembersDetails[pId] || 'Unknown').join(', ')}
                </p>
                {expense.type === 'payment' && (
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 mt-1">Payment Settled</span>
                )}
              </div>
              <div className="flex space-x-2"> {/* Container for buttons */}
                {/* Only show edit/delete button if the current user created the expense */}
                {currentUser && expense.createdBy === currentUser.uid && (
                  <>
                    {/* NEW CONDITION: Only show Edit button if expense.type is NOT 'payment' */}
                    {expense.type !== 'payment' && (
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        title="Edit Expense"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(expense.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Delete Expense"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-auto text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this expense? This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SharedExpenseList;