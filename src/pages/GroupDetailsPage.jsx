import React, { useEffect, useState } from 'react'; // Import useState
import { useParams, useNavigate } from 'react-router-dom';
import { useSplitwise } from '../contexts/SplitwiseContext';
import SharedExpenseForm from '../components/splitwise/SharedExpenseForm';
import SharedExpenseList from '../components/splitwise/SharedExpenseList';
import BalanceDisplay from '../components/splitwise/BalanceDisplay';
import AddMemberForm from '../components/splitwise/AddMemberForm';
import RecordPaymentForm from '../components/splitwise/RecordPaymentForm';
import EditSharedExpenseModal from '../components/splitwise/EditSharedExpenseModal'; // NEW IMPORT

function GroupDetailsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { groups, loadingGroups, splitwiseError, fetchSharedExpensesForGroup, groupMembersDetails, groupBalances } = useSplitwise();

  // NEW STATE: To manage which expense is being edited
  const [editingExpense, setEditingExpense] = useState(null);

  const currentGroup = groups.find(group => group.id === groupId);

  useEffect(() => {
    const unsubscribe = fetchSharedExpensesForGroup(groupId);
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [groupId, fetchSharedExpensesForGroup]);

  // NEW: Handler for when an expense is selected for editing
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
  };

  // NEW: Handler to close the edit modal
  const handleCloseEditModal = () => {
    setEditingExpense(null);
  };

  if (loadingGroups) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading group details...</p>
      </div>
    );
  }

  if (splitwiseError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500">Error: {splitwiseError}</p>
      </div>
    );
  }

  if (!currentGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Group not found!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Group: {currentGroup.name}</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Back to Groups
          </button>
        </div>

        {/* Group Members Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Group Members ({currentGroup.members.length})</h2>
          <ul className="list-disc pl-5 space-y-1">
            {currentGroup.members.map((memberId) => (
              <li key={memberId} className="text-gray-700">
                {groupMembersDetails[memberId] || `Loading... ${memberId.substring(0,4)}`}
              </li>
            ))}
          </ul>
        </div>

        {/* Add New Member Form */}
        <AddMemberForm
          groupId={groupId}
          groupMembers={currentGroup.members}
        />

        {/* Record Payment Form */}
        <RecordPaymentForm
          groupId={groupId}
          groupMembers={currentGroup.members}
          groupMembersDetails={groupMembersDetails}
        />

        {/* Add Shared Expense Form (conditionally hide if editing an expense) */}
        {!editingExpense && (
          <SharedExpenseForm
            groupId={groupId}
            groupMembers={currentGroup.members}
            groupMembersDetails={groupMembersDetails}
          />
        )}

        {/* Shared Expense List */}
        <SharedExpenseList
          groupMembersDetails={groupMembersDetails}
          onEditExpense={handleEditExpense} // NEW: Pass the handler to SharedExpenseList
        />

        {/* Balances Display */}
        <BalanceDisplay
          groupBalances={groupBalances}
          groupMembersDetails={groupMembersDetails}
        />

        {/* NEW: Edit Shared Expense Modal (conditionally rendered) */}
        {editingExpense && (
          <EditSharedExpenseModal
            expense={editingExpense}
            groupMembers={currentGroup.members}
            groupMembersDetails={groupMembersDetails}
            onClose={handleCloseEditModal} // Pass the close handler
          />
        )}
      </div>
    </div>
  );
}

export default GroupDetailsPage;