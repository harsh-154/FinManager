import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { useNavigate } from 'react-router-dom';
import IncomeForm from '../components/finance/IncomeForm';
import ExpenseForm from '../components/finance/ExpenseForm';
import IncomeList from '../components/finance/IncomeList';
import ExpenseList from '../components/finance/ExpenseList';
import BillForm from '../components/finance/BillForm';
import BillList from '../components/finance/BillList'; 

function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const { incomes, expenses, bills, loadingIncomes, loadingExpenses, loadingBills, financeError } = useFinance(); // <--- UPDATE useFinance hook
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redirect to auth page after logout
    } catch (error) {
      console.error("Failed to log out:", error);
      // Optionally display an error message to the user
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  // Calculate totals
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalIncome - totalExpense;

  // calculate upcoming bills
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of today
  const upcomingBillsCount = bills.filter(bill => !bill.isPaid && bill.dueDate >= today).length;


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {currentUser.email}!
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Log Out
          </button>
        </div>

        {financeError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{financeError}</span>
          </div>
        )}

        {/* Financial Summary (UPDATE THIS SECTION) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"> {/* Changed to md:grid-cols-4 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-700">Total Income</h3>
            <p className="text-3xl font-bold text-green-600">₹{totalIncome.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-700">Total Expense</h3>
            <p className="text-3xl font-bold text-red-600">₹{totalExpense.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-700">Balance</h3>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ₹{balance.toLocaleString('en-IN')}
            </p>
          </div>
          {/* Upcoming Bills Card (ADD THIS NEW CARD) */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-700">Upcoming Bills</h3>
            {loadingBills ? (
              <p className="text-2xl font-bold text-purple-600">Loading...</p>
            ) : (
              <p className="text-3xl font-bold text-purple-600">{upcomingBillsCount}</p>
            )}
          </div>
        </div>

        {/* Forms for adding data (ADD BillForm here) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"> {/* Changed to md:grid-cols-3 */}
          <IncomeForm />
          <ExpenseForm />
          <BillForm /> {/* <--- ADD THIS HERE */}
        </div>

        {/* Lists for displaying data (ADD BillList here) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IncomeList />
          <ExpenseList />
          <div className="md:col-span-2"> {/* Make BillList span full width */}
            <BillList /> {/* <--- ADD THIS HERE */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;