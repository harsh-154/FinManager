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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-2">
            <span className="material-icons text-blue-500">groups</span>
            {currentGroup.name}
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded shadow transition"
          >
            <span className="material-icons">arrow_back</span>
            Back to Groups
          </button>
        </div>

        {/* Members & Add Member */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span className="material-icons text-green-500">person</span>
              Members ({currentGroup.members.length})
            </h2>
            <ul className="flex flex-wrap gap-3">
              {currentGroup.members.map((memberId) => (
                <li key={memberId} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                  {/* Replace with avatar if available */}
                  <span className="bg-blue-200 text-blue-800 rounded-full px-2 py-1 text-xs font-bold">
                    {groupMembersDetails[memberId]?.[0] || memberId.substring(0,2)}
                  </span>
                  <span>{groupMembersDetails[memberId] || `Loading...`}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <AddMemberForm groupId={groupId} groupMembers={currentGroup.members} />
            </div>
          </div>

          {/* Record Payment */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span className="material-icons text-yellow-500">payments</span>
              Record Payment
            </h2>
            <RecordPaymentForm
              groupId={groupId}
              groupMembers={currentGroup.members}
              groupMembersDetails={groupMembersDetails}
            />
          </div>
        </div>

        {/* Add Expense & Expense List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add/Edit Expense */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span className="material-icons text-red-500">add_shopping_cart</span>
              {editingExpense ? "Edit Shared Expense" : "Add Shared Expense"}
            </h2>
            {editingExpense ? (
              <EditSharedExpenseModal
                expense={editingExpense}
                groupMembers={currentGroup.members}
                groupMembersDetails={groupMembersDetails}
                onClose={handleCloseEditModal}
              />
            ) : (
              <SharedExpenseForm
                groupId={groupId}
                groupMembers={currentGroup.members}
                groupMembersDetails={groupMembersDetails}
              />
            )}
          </div>

          {/* Expense List */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span className="material-icons text-purple-500">list_alt</span>
              Shared Expenses
            </h2>
            <SharedExpenseList
              groupMembersDetails={groupMembersDetails}
              onEditExpense={handleEditExpense}
            />
          </div>
        </div>

        {/* Balances */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span className="material-icons text-indigo-500">account_balance_wallet</span>
            Balances
          </h2>
          <BalanceDisplay
            groupBalances={groupBalances}
            groupMembersDetails={groupMembersDetails}
          />
        </div>
      </div>
    </div>
  );
}

export default GroupDetailsPage;