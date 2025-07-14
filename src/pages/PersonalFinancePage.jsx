import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext'; // Potentially useful if components need currentUser.uid
import { useSplitwise } from '../contexts/SplitwiseContext';
import { FaPiggyBank } from 'react-icons/fa';
import { FaMoneyBillWave, FaPlus, FaTrash, FaRegListAlt, FaReceipt, FaCheckCircle } from 'react-icons/fa';

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
    <div className="bg-gray-50 p-4 rounded-xl shadow flex flex-col gap-2 mb-4 border border-green-100">
      <h2 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-3">
        <FaMoneyBillWave className="text-green-500" /> Add New Income
      </h2>
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
          className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
        >
          <FaPlus /> {loading ? 'Adding...' : 'Add Income'}
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
    <div className="bg-white p-4 rounded-xl shadow border border-green-100">
      <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2 mb-3">
        <FaRegListAlt className="text-green-500" /> Recent Incomes
      </h3>
      <ul className="divide-y divide-gray-200">
        {incomes.map((income) => (
          <li key={income.id} className="py-3 flex justify-between items-center hover:bg-green-50 rounded transition">
            <div>
              <p className="text-gray-900 font-medium">{income.source}: ₹{income.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-500">
                Date: {income.createdAt instanceof Date ? income.createdAt.toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <button
              onClick={() => onDeleteIncome(income.id)}
              className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            >
              <FaTrash /> Delete
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
  const [category,setCategory]=useState('General');
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) {
      alert('Please enter both description and amount.');
      return;
    }
    const success = await onAddExpense(category, parseFloat(amount),description);
    if (success) {
      setDescription('');
      setAmount('');
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl shadow flex flex-col gap-2 mb-4 border border-red-100">
      <h2 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-3">
        <FaReceipt className="text-red-500" /> Add New Expense
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="expenseCategory" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="expenseCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          >
            <option value="General">General</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Utilities">Utilities</option>
          </select>
        </div>
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
          className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
        >
          <FaPlus /> {loading ? 'Adding...' : 'Add Expense'}
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
    <div className="bg-white p-4 rounded-xl shadow border border-red-100">
      <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2 mb-3">
        <FaRegListAlt className="text-red-500" /> Recent Expenses
      </h3>
      <ul className="divide-y divide-gray-200">
        {expenses.map((expense) => (
          <li key={expense.id} className="py-3 flex justify-between items-center hover:bg-red-50 rounded transition">
            <div>
              <p className="text-gray-900 font-medium">{expense.description}: ₹{expense.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-500">
                Date: {expense.createdAt instanceof Date ? expense.createdAt.toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <button
              onClick={() => onDeleteExpense(expense.id)}
              className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            >
              <FaTrash /> Delete
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
    <div className="bg-gray-50 p-4 rounded-xl shadow flex flex-col gap-2 mb-4 border border-blue-100">
      <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-3">
        <FaReceipt className="text-blue-500" /> Add New Bill
      </h2>
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
          className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          <FaPlus /> {loading ? 'Adding...' : 'Add Bill'}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
};

const BillList = ({ bills, onDeleteBill, onMarkBillAsPaid, highlightOverdue = false }) => {
  if (bills.length === 0) {
    return <p className="text-center text-gray-600">No bills recorded yet.</p>;
  }
  return (
    <div className="bg-white p-4 rounded-xl shadow border border-blue-100">
      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2 mb-3">
        <FaRegListAlt className="text-blue-500" /> Upcoming Bills
      </h3>
      <ul className="divide-y divide-gray-200">
        {bills.map((bill) => {
          const isOverdue = !bill.paidAt && new Date(bill.dueDate) < new Date();
          return (
            <li key={bill.id} className={`py-3 flex justify-between items-center rounded transition ${highlightOverdue && isOverdue ? 'bg-red-50 border-l-4 border-red-400' : 'hover:bg-blue-50'}`}>
              <div>
                <p className={`text-gray-900 font-medium ${highlightOverdue && isOverdue ? 'text-red-700' : ''}`}>{bill.name}: ₹{bill.amount.toFixed(2)}</p>
                <p className={`text-sm ${highlightOverdue && isOverdue ? 'text-red-600' : 'text-gray-500'}`}>Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                {bill.paidAt && (
                  <p className="text-sm text-green-600 flex items-center gap-1"><FaCheckCircle className="inline text-green-500" /> Paid on: {bill.paidAt.toLocaleDateString()}</p>
                )}
                {highlightOverdue && isOverdue && !bill.paidAt && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><span className="material-icons text-red-400 text-base">warning</span> Overdue</p>
                )}
              </div>
              <div className="flex space-x-2">
                {!bill.paidAt && (
                  <button
                    onClick={() => onMarkBillAsPaid(bill.id, bill.isPaid)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  >
                    <FaCheckCircle /> Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => onDeleteBill(bill.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </li>
          );
        })}
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
    toggleBillPaidStatus,
  } = useFinance();

  const { currentUser } = useAuth();
  const { groups, loadingGroups } = useSplitwise();
  const [groupBalancesByGroup, setGroupBalancesByGroup] = React.useState([]);
  const [totalOwed, setTotalOwed] = React.useState(0);
  const [totalOwes, setTotalOwes] = React.useState(0);

  React.useEffect(() => {
    if (!currentUser || !groups || groups.length === 0) {
      setGroupBalancesByGroup([]);
      setTotalOwed(0);
      setTotalOwes(0);
      return;
    }
    // For each group, fetch its expenses and calculate balances
    const fetchAllGroupBalances = async () => {
      const { db } = await import('../lib/firebase');
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const balancesArr = [];
      let owed = 0;
      let owes = 0;
      for (const group of groups) {
        // Fetch all expenses for this group
        const q = query(collection(db, 'sharedExpenses'), where('groupId', '==', group.id), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Calculate balances for this group
        const members = group.members;
        // Inline the calculateGroupBalances logic
        const balances = {};
        members.forEach(memberId => { balances[memberId] = 0; });
        expenses.forEach(expense => {
          if (expense.isPayment) {
            balances[expense.paidBy] -= expense.amount;
            if (expense.participants && expense.participants.length > 0) {
              balances[expense.participants[0]] += expense.amount;
            }
            return;
          }
          const { amount, paidBy, participants, splitMethod, exactAmounts } = expense;
          const validParticipants = participants.filter(p => members.includes(p));
          if (validParticipants.length === 0) return;
          balances[paidBy] += amount;
          if (splitMethod === 'equal') {
            const share = amount / validParticipants.length;
            validParticipants.forEach(memberId => { balances[memberId] -= share; });
          } else if (splitMethod === 'exact') {
            validParticipants.forEach(memberId => {
              const exactShare = exactAmounts[memberId] || 0;
              balances[memberId] -= exactShare;
            });
          }
        });
        const myBalance = balances[currentUser.uid] || 0;
        balancesArr.push({ groupName: group.name, groupId: group.id, balance: myBalance });
        if (myBalance > 0) owed += myBalance;
        if (myBalance < 0) owes += myBalance;
      }
      setGroupBalancesByGroup(balancesArr);
      setTotalOwed(owed);
      setTotalOwes(owes);
    };
    fetchAllGroupBalances();
  }, [currentUser, groups]);

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
  const totalPaidBills = bills
  .filter((bill) => bill.isPaid)
  .reduce((sum, bill) => sum + (bill.amount || 0), 0);
  const totalIncome = incomes.reduce((sum, income) => sum + (income.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const availableBalance = totalIncome - totalExpenses - totalPaidBills;
  const balanceStyle = availableBalance < 0 ? 'text-red-600' : 'text-green-700';
  const balanceLabel = availableBalance < 0 ? `(debt)` : '';

  


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Group Balances Summary */}
        {groupBalancesByGroup.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-icons text-indigo-500">groups</span>
              Group Balances Overview
            </h2>
            <div className="flex flex-wrap gap-4 mb-2">
              {groupBalancesByGroup.map(gb => (
                <span key={gb.groupId} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shadow-sm mr-2 mb-2 ${gb.balance > 0 ? 'bg-green-100 text-green-700' : gb.balance < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {gb.groupName}
                  <span className="ml-2 font-mono">{gb.balance > 0 ? '+' : ''}{gb.balance.toFixed(2)}</span>
                </span>
              ))}
            </div>
            <div className="flex gap-8 mt-2">
              <div className="flex items-center gap-2">
                <span className="material-icons text-green-500">arrow_downward</span>
                <span className="font-semibold text-green-700">Total to Receive:</span>
                <span className="font-mono text-green-700">₹{totalOwed.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-icons text-red-500">arrow_upward</span>
                <span className="font-semibold text-red-700">Total to Pay:</span>
                <span className="font-mono text-red-700">₹{Math.abs(totalOwes).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        {/* Available Balance Card */}
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-icons text-green-500">account_balance</span>
            Available Balance
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold ${balanceStyle}`}>₹{Math.abs(availableBalance).toFixed(2)}</span>
              <span className="text-base font-medium text-gray-500">{balanceLabel}</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm mt-2 sm:mt-0">
              <span className="flex items-center gap-1 text-green-700"><span className="material-icons text-green-400 text-base">trending_up</span> Income: <span className="font-semibold ml-1">₹{totalIncome.toFixed(2)}</span></span>
              <span className="flex items-center gap-1 text-red-700"><span className="material-icons text-red-400 text-base">trending_down</span> Expenses: <span className="font-semibold ml-1">₹{totalExpenses.toFixed(2)}</span></span>
              <span className="flex items-center gap-1 text-blue-700"><span className="material-icons text-blue-400 text-base">receipt_long</span> Paid Bills: <span className="font-semibold ml-1">₹{totalPaidBills.toFixed(2)}</span></span>
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
          <span className="material-icons text-green-500">account_balance_wallet</span>
          Personal Finance Dashboard
        </h1>
        {/* Income Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <IncomeForm onAddIncome={addIncome} loading={loadingIncomes} error={financeError} />
            <IncomeList incomes={incomes} onDeleteIncome={deleteIncome} />
          </div>
          <div>
            <ExpenseForm onAddExpense={addExpense} loading={loadingExpenses} error={financeError} />
            <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
          </div>
        </div>
        {/* Bills Section */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            <span className="material-icons text-blue-500">receipt_long</span>
            Upcoming Bills
          </h2>
          <BillForm onAddBill={addBill} loading={loadingBills} error={financeError} />
          <BillList bills={bills.filter(bill => !bill.paidAt && new Date(bill.dueDate) >= new Date())} onDeleteBill={deleteBill} onMarkBillAsPaid={toggleBillPaidStatus} />
        </div>
        {/* Unpaid Past Bills Section */}
        {bills.filter(bill => !bill.paidAt && new Date(bill.dueDate) < new Date()).length > 0 && (
          <div className="bg-red-50 rounded-xl shadow p-6 mt-4 border border-red-200">
            <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center gap-2">
              <span className="material-icons text-red-500">warning</span>
              Unpaid Past Bills (Overdue)
            </h2>
            <BillList
              bills={bills.filter(bill => !bill.paidAt && new Date(bill.dueDate) < new Date())}
              onDeleteBill={deleteBill}
              onMarkBillAsPaid={toggleBillPaidStatus}
              highlightOverdue={true}
            />
          </div>
        )}
        {/* Paid Bills Section */}
        {bills.filter(bill => bill.paidAt).length > 0 && (
          <div className="bg-green-50 rounded-xl shadow p-6 mt-4 border border-green-200">
            <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
              <span className="material-icons text-green-500">check_circle</span>
              Paid Bills
            </h2>
            <BillList
              bills={bills.filter(bill => bill.paidAt)}
              onDeleteBill={deleteBill}
              onMarkBillAsPaid={toggleBillPaidStatus}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonalFinancePage;