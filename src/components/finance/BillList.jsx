import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';

function BillList() {
  const { bills, loadingBills, financeError, deleteFinanceItem, toggleBillPaidStatus } = useFinance();

  if (loadingBills) {
    return <div className="text-center py-4">Loading bills...</div>;
  }

  if (financeError) {
    return <div className="text-red-500 text-center py-4">Error: {financeError}</div>;
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      await deleteFinanceItem('bills', id);
    }
  };

  const handleTogglePaid = async (billId, currentStatus) => {
    await toggleBillPaidStatus(billId, currentStatus);
  };

  // Sort bills: unpaid first, then by nearest due date
  const sortedBills = [...bills].sort((a, b) => {
    if (a.isPaid && !b.isPaid) return 1; // Paid bills go to the end
    if (!a.isPaid && b.isPaid) return -1; // Unpaid bills come first

    // For bills with same paid status, sort by due date
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Upcoming & Recent Bills</h2>
      {sortedBills.length === 0 ? (
        <p className="text-gray-600">No bills recorded yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {sortedBills.map((bill) => (
            <li key={bill.id} className="py-3 flex justify-between items-center">
              <div>
                <p className={`text-lg font-medium ${bill.isPaid ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{bill.name}</p>
                <p className={`text-sm ${bill.isPaid ? 'text-gray-400' : 'text-gray-500'}`}>
                  {bill.category} - Due: {bill.dueDate.toLocaleDateString()}
                  {bill.isRecurring && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Recurring</span>}
                </p>
                {bill.isPaid && bill.paidAt && (
                  <p className="text-xs text-gray-500">Paid: {bill.paidAt.toLocaleDateString()}</p>
                )}
              </div>
              <div className="flex items-center">
                <p className={`text-lg font-bold ${bill.isPaid ? 'text-gray-500 line-through' : 'text-purple-600'} mr-4`}>₹{bill.amount.toLocaleString('en-IN')}</p>
                <button
                  onClick={() => handleTogglePaid(bill.id, bill.isPaid)}
                  className={`mr-2 p-1 rounded-full focus:outline-none ${bill.isPaid ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-700'}`}
                  title={bill.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                >
                  {bill.isPaid ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(bill.id)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  title="Delete Bill"
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

export default BillList;