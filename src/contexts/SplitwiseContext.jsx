import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, auth } from '../lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const SplitwiseContext = createContext();

export const useSplitwise = () => {
  return useContext(SplitwiseContext);
};

export const SplitwiseProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [splitwiseError, setSplitwiseError] = useState(null);

  const [currentGroupExpenses, setCurrentGroupExpenses] = useState([]);
  const [loadingCurrentGroupExpenses, setLoadingCurrentGroupExpenses] = useState(false);
  const [groupMembersDetails, setGroupMembersDetails] = useState({});
  const [groupBalances, setGroupBalances] = useState({});

  // --- Utility to get member details ---
  const fetchMemberDetails = useCallback(async (memberUids) => {
    if (!memberUids || memberUids.length === 0) return {};
    const details = {};
    for (const uid of memberUids) {
      if (currentUser && currentUser.uid === uid) {
        details[uid] = currentUser.email;
      } else {
        details[uid] = `User-${uid.substring(0, 4)}`;
        try {
            const userDocRef = doc(db, 'userProfiles', uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                details[uid] = userDocSnap.data().displayName || userDocSnap.data().email || `User-${uid.substring(0, 4)}`;
            }
        } catch (error) {
            console.warn("Could not fetch user profile for:", uid, error);
        }
      }
    }
    return details;
  }, [currentUser]);


  // --- Group Management Functions ---

  const createGroup = async (groupName, initialMembers = []) => {
    if (!currentUser) {
      setSplitwiseError('User not authenticated.');
      return false;
    }
    try {
      const membersWithCurrentUser = Array.from(new Set([...initialMembers, currentUser.uid]));

      const docRef = await addDoc(collection(db, 'groups'), {
        name: groupName.trim(),
        members: membersWithCurrentUser,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setSplitwiseError(null);
      return docRef.id;
    } catch (error) {
      console.error('Error creating group:', error);
      setSplitwiseError(`Failed to create group: ${error.message}`);
      return false;
    }
  };

  const addGroupMember = async (groupId, newMemberUid) => {
    if (!currentUser) {
      setSplitwiseError('User not authenticated.');
      return false;
    }
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(newMemberUid)
      });
      setSplitwiseError(null);
      return true;
    } catch (error) {
      console.error('Error adding group member:', error);
      setSplitwiseError(`Failed to add member: ${error.message}`);
      return false;
    }
  };

  const removeGroupMember = async (groupId, memberUidToRemove) => {
    if (!currentUser) {
      setSplitwiseError('User not authenticated.');
      return false;
    }
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        members: arrayRemove(memberUidToRemove)
      });
      setSplitwiseError(null);
      return true;
    } catch (error) {
      console.error('Error removing group member:', error);
      setSplitwiseError(`Failed to remove member: ${error.message}`);
      return false;
    }
  };

  const deleteGroup = async (groupId) => {
    if (!currentUser) {
        setSplitwiseError('No user logged in to delete group.');
        return false;
    }
    try {
        const expensesQuery = query(collection(db, 'sharedExpenses'), where('groupId', '==', groupId));
        const expensesSnapshot = await getDocs(expensesQuery);
        const batch = db.batch();
        expensesSnapshot.docs.forEach((d) => {
            batch.delete(d.ref);
        });
        await batch.commit();

        await deleteDoc(doc(db, 'groups', groupId));
        setSplitwiseError(null);
        return true;
    } catch (error) {
        console.error(`Error deleting group and its expenses:`, error);
        setSplitwiseError(`Failed to delete group: ${error.message}`);
        return false;
    }
  };


  // --- Shared Expense Management ---

  const addSharedExpense = async (groupId, description, amount, paidBy, participants, splitMethod, exactAmounts = {}) => {
    if (!currentUser) {
      setSplitwiseError('User not authenticated.');
      return false;
    }
    try {
      if (!description || !amount || amount <= 0 || !paidBy || participants.length === 0) {
        throw new Error('Missing required expense details.');
      }

      await addDoc(collection(db, 'sharedExpenses'), {
        groupId: groupId,
        description: description.trim(),
        amount: Number(amount),
        paidBy: paidBy,
        participants: participants,
        splitMethod: splitMethod,
        exactAmounts: splitMethod === 'exact' ? exactAmounts : {},
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
      });
      setSplitwiseError(null);
      return true;
    } catch (error) {
      console.error('Error adding shared expense:', error);
      setSplitwiseError(`Failed to add shared expense: ${error.message}`);
      return false;
    }
  };

  const deleteSharedExpense = async (expenseId) => {
    if (!currentUser) {
      setSplitwiseError('No user logged in to delete expense.');
      return false;
    }
    try {
      await deleteDoc(doc(db, 'sharedExpenses', expenseId));
      setSplitwiseError(null);
      return true;
    } catch (error) {
      console.error(`Error deleting shared expense:`, error);
      setSplitwiseError(`Failed to delete expense: ${error.message}`);
      return false;
    }
  };


  // --- NEW: Record Payment Function ---
  const recordPayment = async (groupId, payerUid, receiverUid, amount) => {
    if (!currentUser) {
      setSplitwiseError('User not authenticated.');
      return false;
    }
    if (payerUid === receiverUid) {
      setSplitwiseError('Cannot record payment to oneself.');
      return false;
    }
    if (amount <= 0) {
      setSplitwiseError('Payment amount must be positive.');
      return false;
    }

    try {
      // To correctly affect balances in our existing 'calculateGroupBalances' logic:
      // If Payer (A) pays Receiver (B) an amount X:
      //   - B's balance should effectively increase by X (they received money).
      //   - A's balance should effectively decrease by X (they paid money).
      // This is achieved by making B the 'paidBy' person (gets credit) and A the 'participant' (gets debit).
      await addDoc(collection(db, 'sharedExpenses'), {
        groupId: groupId,
        description: `Payment: ${groupMembersDetails[payerUid] || 'Someone'} paid ${groupMembersDetails[receiverUid] || 'someone else'}`,
        amount: Number(amount),
        paidBy: receiverUid, // The person who *received* the money (gets credited)
        participants: [payerUid], // The person who *paid* the money (gets debited)
        splitMethod: 'exact',
        exactAmounts: { [payerUid]: Number(amount) }, // Payer owes this exact amount in this "payment expense"
        type: 'payment', // Mark this as a payment transaction
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
      });
      setSplitwiseError(null);
      return true;
    } catch (error) {
      console.error('Error recording payment:', error);
      setSplitwiseError(`Failed to record payment: ${error.message}`);
      return false;
    }
  };


  // --- Effect to fetch groups for the current user ---
  useEffect(() => {
    if (!currentUser) {
      setGroups([]);
      setLoadingGroups(false);
      return;
    }

    setLoadingGroups(true);
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedGroups = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
        }));
        setGroups(fetchedGroups);
        setLoadingGroups(false);
        setSplitwiseError(null);
      },
      (error) => {
        console.error('Error fetching groups:', error);
        setSplitwiseError(`Failed to fetch groups: ${error.message}`);
        setLoadingGroups(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);


  // --- Fetching Shared Expenses for a specific group ---
  const fetchSharedExpensesForGroup = useCallback((groupId) => {
    if (!currentUser || !groupId) {
      setCurrentGroupExpenses([]);
      setLoadingCurrentGroupExpenses(false);
      return () => {};
    }

    setLoadingCurrentGroupExpenses(true);
    const q = query(
      collection(db, 'sharedExpenses'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expenses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
        }));
        setCurrentGroupExpenses(expenses);
        setLoadingCurrentGroupExpenses(false);
        setSplitwiseError(null);
      },
      (error) => {
        console.error('Error fetching shared expenses:', error);
        setSplitwiseError(`Failed to fetch shared expenses: ${error.message}`);
        setLoadingCurrentGroupExpenses(false);
      }
    );
    return () => unsubscribe();
  }, [currentUser]);


  // --- Fetch and manage user profiles ---
  useEffect(() => {
    const allMemberUids = groups.flatMap(group => group.members);
    const uniqueMemberUids = Array.from(new Set(allMemberUids));

    const loadMemberDetails = async () => {
      const details = await fetchMemberDetails(uniqueMemberUids);
      setGroupMembersDetails(prev => ({ ...prev, ...details }));
    };

    if (uniqueMemberUids.length > 0) {
      loadMemberDetails();
    }
  }, [groups, fetchMemberDetails]);


  // --- NEW: Balance Calculation Logic ---
  const calculateGroupBalances = useCallback((expenses, members) => {
    const balances = {};
    members.forEach(memberId => {
      balances[memberId] = 0; // Initialize all members to 0 balance
    });

    expenses.forEach(expense => {
      const paidBy = expense.paidBy;
      const amount = expense.amount;
      const participants = expense.participants;
      const splitMethod = expense.splitMethod;
      const exactAmounts = expense.exactAmounts || {};

      // Credit the person who paid the full amount
      if (balances[paidBy] !== undefined) {
        balances[paidBy] += amount;
      }

      // Debit participants based on split method
      if (splitMethod === 'equal') {
        const perPerson = amount / participants.length;
        participants.forEach(participantId => {
          if (balances[participantId] !== undefined) {
            balances[participantId] -= perPerson;
          }
        });
      } else if (splitMethod === 'exact') {
        participants.forEach(participantId => {
          const exactAmount = exactAmounts[participantId];
          if (balances[participantId] !== undefined && exactAmount !== undefined) {
            balances[participantId] -= exactAmount;
          }
        });
      }
    });

    // Round balances to two decimal places to avoid floating point issues
    for (const memberId in balances) {
        if (balances.hasOwnProperty(memberId)) {
            balances[memberId] = parseFloat(balances[memberId].toFixed(2));
        }
    }

    return balances;
  }, []); // No dependencies as it operates on its arguments


  // --- NEW EFFECT: Calculate balances whenever expenses or members change ---
  useEffect(() => {
    if (currentGroupExpenses.length > 0 || groups.length > 0) {
        const currentSelectedGroup = groups.find(g =>
            currentGroupExpenses.length > 0 && g.id === currentGroupExpenses[0].groupId
        );

        if (currentSelectedGroup && currentSelectedGroup.members.length > 0) {
            const calculated = calculateGroupBalances(currentGroupExpenses, currentSelectedGroup.members);
            setGroupBalances(calculated);
        } else if (currentGroupExpenses.length === 0) {
            const membersOfAllGroups = Array.from(new Set(groups.flatMap(group => group.members)));
            const emptyBalances = {};
            membersOfAllGroups.forEach(uid => emptyBalances[uid] = 0);
            setGroupBalances(emptyBalances);
        }
    } else {
        setGroupBalances({});
    }
  }, [currentGroupExpenses, groups, calculateGroupBalances]);


  const value = {
    groups,
    loadingGroups,
    splitwiseError,
    createGroup,
    addGroupMember,
    removeGroupMember,
    deleteGroup,
    addSharedExpense,
    deleteSharedExpense,
    recordPayment, // Expose the new recordPayment function
    currentGroupExpenses,
    loadingCurrentGroupExpenses,
    fetchSharedExpensesForGroup,
    groupMembersDetails,
    groupBalances,
  };

  return (
    <SplitwiseContext.Provider value={value}>
      {children}
    </SplitwiseContext.Provider>
  );
};