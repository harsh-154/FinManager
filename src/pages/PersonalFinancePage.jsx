import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext'; // Potentially useful if components need currentUser.uid

// --- Income Components ---
const IncomeForm = ({ onAddIncome, loading, error }) => {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!source.trim() || !amount) {
      alert('Please enter both source and amount.');
      return;
    }
    // Convert amount to a number
    const success = await onAddIncome(source, parseFloat(amount));
    if (success) {
      setSource('');
      setAmount('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Add New Income</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="incomeSource" className="block text-sm font-medium text-gray-700">Source</label>
          <input
            type="text"
            id="incomeSource"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="e.g., Salary, Freelance, Gift"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="incomeAmount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            id="incomeAmount"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {loading ? 'Adding...' : 'Add Income'}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
};

const IncomeList = ({ incomes, onDeleteIncome }) => {
  if (incomes.length === 0) {
    return <p className="text-center text-gray-600">No incomes recorded yet.</p>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Incomes</h3>
      <ul className="divide-y divide-gray-200">
        {incomes.map((income) => (
          <li key={income.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="text-gray-900 font-medium">{income.source}: ₹{income.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-500">
                Date: {income.createdAt instanceof Date ? income.createdAt.toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <button
              onClick={() => onDeleteIncome(income.id)}
              className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- Expense Components ---
const ExpenseForm = ({ onAddExpense, loading, error }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) {
      alert('Please enter both description and amount.');
      return;
    }
    const success = await onAddExpense(description, parseFloat(amount));
    if (success) {
      setDescription('');
      setAmount('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Add New Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="expenseDescription" className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            id="expenseDescription"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            placeholder="e.g., Groceries, Rent, Utilities"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="expenseAmount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            id="expenseAmount"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
};

const ExpenseList = ({ expenses, onDeleteExpense }) => {
  if (expenses.length === 0) {
    return <p className="text-center text-gray-600">No expenses recorded yet.</p>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Expenses</h3>
      <ul className="divide-y divide-gray-200">
        {expenses.map((expense) => (
          <li key={expense.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="text-gray-900 font-medium">{expense.description}: ₹{expense.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-500">
                Date: {expense.createdAt instanceof Date ? expense.createdAt.toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <button
              onClick={() => onDeleteExpense(expense.id)}
              className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- Bill Components ---
const BillForm = ({ onAddBill, loading, error }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !amount || !dueDate) {
      alert('Please enter all bill details.');
      return;
    }
    const success = await onAddBill(name, parseFloat(amount), dueDate);
    if (success) {
      setName('');
      setAmount('');
      setDueDate('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Add New Bill</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="billName" className="block text-sm font-medium text-gray-700">Bill Name</label>
          <input
            type="text"
            id="billName"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Electricity, Internet"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            id="dueDate"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? 'Adding...' : 'Add Bill'}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
};

const BillList = ({ bills, onDeleteBill, onMarkBillAsPaid }) => {
  if (bills.length === 0) {
    return <p className="text-center text-gray-600">No bills recorded yet.</p>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Upcoming Bills</h3>
      <ul className="divide-y divide-gray-200">
        {bills.map((bill) => (
          <li key={bill.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="text-gray-900 font-medium">{bill.name}: ₹{bill.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
              {bill.paidAt && (
                <p className="text-sm text-green-600">Paid on: {bill.paidAt.toLocaleDateString()}</p>
              )}
            </div>
            <div className="flex space-x-2">
              {!bill.paidAt && (
                <button
                  onClick={() => onMarkBillAsPaid(bill.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Mark as Paid
                </button>
              )}
              <button
                onClick={() => onDeleteBill(bill.id)}
                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};


function PersonalFinancePage() {
  const {
    incomes,
    expenses,
    bills,
    loadingIncomes,
    loadingExpenses,
    loadingBills,
    financeError,
    addIncome,
    addExpense,
    addBill,
    deleteIncome,
    deleteExpense,
    deleteBill,
    markBillAsPaid,
  } = useFinance();

  // For debugging, you might want to log the data and loading states
  // useEffect(() => {
  //   console.log('Incomes:', incomes);
  //   console.log('Expenses:', expenses);
  //   console.log('Bills:', bills);
  //   console.log('Loading Incomes:', loadingIncomes);
  //   console.log('Loading Expenses:', loadingExpenses);
  //   console.log('Loading Bills:', loadingBills);
  //   console.log('Finance Error:', financeError);
  // }, [incomes, expenses, bills, loadingIncomes, loadingExpenses, loadingBills, financeError]);


  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">My Personal Finances</h1>

      {financeError && <p className="text-red-500 text-center mb-4">{financeError}</p>}

      {/* Income Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Income</h2>
        <IncomeForm onAddIncome={addIncome} loading={loadingIncomes} error={financeError} />
        {loadingIncomes ? (
          <p className="text-center text-gray-600">Loading incomes...</p>
        ) : (
          <IncomeList incomes={incomes} onDeleteIncome={deleteIncome} />
        )}
      </section>

      {/* Expenses Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Expenses</h2>
        <ExpenseForm onAddExpense={addExpense} loading={loadingExpenses} error={financeError} />
        {loadingExpenses ? (
          <p className="text-center text-gray-600">Loading expenses...</p>
        ) : (
          <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
        )}
      </section>

      {/* Bills Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bills</h2>
        <BillForm onAddBill={addBill} loading={loadingBills} error={financeError} />
        {loadingBills ? (
          <p className="text-center text-gray-600">Loading bills...</p>
        ) : (
          <BillList bills={bills} onDeleteBill={deleteBill} onMarkBillAsPaid={markBillAsPaid} />
        )}
      </section>
    </div>
  );
}

export default PersonalFinancePage;