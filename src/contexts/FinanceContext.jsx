import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp // <--- ENSURE THIS IS PRESENT
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { desc } from 'framer-motion/client';

const FinanceContext = createContext();

export const useFinance = () => {
  return useContext(FinanceContext);
};

export const FinanceProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [bills, setBills] = useState([]);
  const [loadingIncomes, setLoadingIncomes] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadingBills, setLoadingBills] = useState(true);
  const [financeError, setFinanceError] = useState(null);

  // Function to add an income
  const addIncome = async (source, amount) => {
    if (!currentUser) {
      setFinanceError('No user logged in to add income.');
      return false;
    }
    try {
      await addDoc(collection(db, 'incomes'), {
        userId: currentUser.uid,
        source: source.trim(),
        amount: Number(amount),
        date: serverTimestamp(),
      });
      setFinanceError(null);
      return true;
    } catch (error) {
      console.error('Error adding income:', error);
      setFinanceError(`Failed to add income: ${error.message}`);
      return false;
    }
  };

  // Function to add an expense
  const addExpense = async (category, amount, description) => {
    if (!currentUser) {
      setFinanceError('No user logged in to add expense.');
      return false;
    }
    try {
      await addDoc(collection(db, 'expenses'), {
        userId: currentUser.uid,
        category: category,
        amount: Number(amount),
        description: (description || '').trim(),
        date: serverTimestamp(),
      });
      setFinanceError(null);
      return true;
    } catch (error) {
      console.error('Error adding expense:', error);
      setFinanceError(`Failed to add expense: ${error.message}`);
      return false;
    }
  };

  // Function to add a bill
  const addBill = async (name, amount, dueDate, isRecurring=false, category='General') => {
    if (!currentUser) {
      setFinanceError('No user logged in to add a bill.');
      return false;
    }
    try {
      await addDoc(collection(db, 'bills'), {
        userId: currentUser.uid,
        name: name.trim(),
        amount: Number(amount),
        dueDate: Timestamp.fromDate(new Date(dueDate)),
        isRecurring: Boolean(isRecurring),
        category: category || 'General',
        isPaid: false,
        createdAt: serverTimestamp(),
      });
      setFinanceError(null);
      return true;
    } catch (error) {
      console.error('Error adding bill:', error);
      setFinanceError(`Failed to add bill: ${error.message}`);
      return false;
    }
  };

  // Function to toggle bill paid status
  const toggleBillPaidStatus = async (billId, currentStatus) => {
    if (!currentUser) {
      setFinanceError('No user logged in to update bill status.');
      return false;
    }
    try {
      const billRef = doc(db, 'bills', billId);
      await updateDoc(billRef, { // This is where updateDoc is used
        isPaid: !currentStatus,
        paidAt: !currentStatus ? serverTimestamp() : null
      });
      setFinanceError(null);
      return true;
    } catch (error) {
      console.error('Error toggling bill status:', error);
      setFinanceError(`Failed to update bill status: ${error.message}`);
      return false;
    }
  };


  // Function to delete income/expense/bill
  const deleteFinanceItem = async (collectionName, id) => {
    if (!currentUser) {
      setFinanceError('No user logged in to delete item.');
      return false;
    }
    try {
      await deleteDoc(doc(db, collectionName, id));
      setFinanceError(null);
      return true;
    } catch (error) {
      console.error(`Error deleting ${collectionName} item:`, error);
      setFinanceError(`Failed to delete item: ${error.message}`);
      return false;
    }
  };

  // Effect to fetch incomes for the current user
  useEffect(() => {
    if (!currentUser) {
      setIncomes([]);
      setLoadingIncomes(false);
      return;
    }

    setLoadingIncomes(true);
    const q = query(
      collection(db, 'incomes'),
      where('userId', '==', currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedIncomes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date ? doc.data().date.toDate() : new Date(),
        }));
        setIncomes(fetchedIncomes);
        setLoadingIncomes(false);
        setFinanceError(null);
      },
      (error) => {
        console.error('Error fetching incomes:', error);
        setFinanceError(`Failed to fetch incomes: ${error.message}`);
        setLoadingIncomes(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Effect to fetch expenses for the current user
  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      setLoadingExpenses(false);
      return;
    }

    setLoadingExpenses(true);
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedExpenses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date ? doc.data().date.toDate() : new Date(),
        }));
        setExpenses(fetchedExpenses);
        setLoadingExpenses(false);
        setFinanceError(null);
      },
      (error) => {
        console.error('Error fetching expenses:', error);
        setFinanceError(`Failed to fetch expenses: ${error.message}`);
        setLoadingExpenses(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Effect to fetch bills for the current user
  useEffect(() => {
    if (!currentUser) {
      setBills([]);
      setLoadingBills(false);
      return;
    }

    setLoadingBills(true);
    const q = query(
      collection(db, 'bills'),
      where('userId', '==', currentUser.uid),
      orderBy('dueDate', 'asc'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedBills = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dueDate: (() => {
            const raw = doc.data().dueDate;
            if (raw && typeof raw.toDate === 'function') return raw.toDate();
            if (raw instanceof Date || typeof raw === 'string') return new Date(raw);
            return new Date(); // fallback
          })(),
          paidAt: (() => {
            const raw = doc.data().paidAt;
            if (raw && typeof raw.toDate === 'function') return raw.toDate();
            if (raw instanceof Date || typeof raw === 'string') return new Date(raw);
            return null;
          })(),
        }));
        setBills(fetchedBills);
        setLoadingBills(false);
        setFinanceError(null);
      },
      (error) => {
        console.error('Error fetching bills:', error);
        setFinanceError(`Failed to fetch bills: ${error.message}`);
        setLoadingBills(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const value = {
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
    deleteFinanceItem,
    toggleBillPaidStatus,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};