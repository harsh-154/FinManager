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
  writeBatch, // Import writeBatch for batch operations
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
    // Fetch only unique UIDs
    const uniqueUids = Array.from(new Set(memberUids));

    // Firebase 'in' query supports up to 10 items
    // For more, you'd need multiple queries or a different approach
    if (uniqueUids.length > 10) {
      console.warn("Too many UIDs for a single 'in' query. Consider fetching in batches or rethinking strategy.");
      // Fallback: Fetch one by one if too many for 'in'
      for (const uid of uniqueUids) {
        const userDocRef = doc(db, 'userProfiles', uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          details[uid] = userDocSnap.data().displayName || userDocSnap.data().email.split('@')[0];
        } else {
          details[uid] = 'Unknown User';
        }
      }
    } else {
      const q = query(collection(db, 'userProfiles'), where('uid', 'in', uniqueUids));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((d) => {
        details[d.id] = d.data().displayName || d.data().email.split('@')[0];
      });
    }
    return details;
  }, []);


  // --- Effect to fetch groups for the current user ---
  useEffect(() => {
    // IMPORTANT FIX: Ensure currentUser and currentUser.uid are available
    if (!currentUser || !currentUser.uid) {
      setGroups([]);
      setLoadingGroups(false);
      return;
    }

    setLoadingGroups(true);
    setSplitwiseError(null); // Clear previous errors

    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains-any', [currentUser.uid]),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const fetchedGroups = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
        }));
        setGroups(fetchedGroups);
        setLoadingGroups(false);
        setSplitwiseError(null);

        // Fetch member details for all members in fetched groups
        const allMemberUids = Array.from(new Set(fetchedGroups.flatMap(group => group.members || [])));
        const details = await fetchMemberDetails(allMemberUids);
        setGroupMembersDetails(details);
      },
      (error) => {
        console.error('Error fetching groups:', error);
        setSplitwiseError(`Failed to fetch groups: ${error.message}`);
        setLoadingGroups(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, fetchMemberDetails]); // Depend on currentUser and fetchMemberDetails


  // --- Function to create a new group ---
  const createGroup = useCallback(async (name, initialMembers = []) => {
    if (!currentUser) {
      setSplitwiseError('No user logged in to create group.');
      return false;
    }
    if (!name.trim()) {
      setSplitwiseError('Group name cannot be empty.');
      return false;
    }

    const membersToInclude = Array.from(new Set([...initialMembers, currentUser.uid]));

    try {
      const docRef = await addDoc(collection(db, 'groups'), {
        name: name.trim(),
        createdBy: currentUser.uid,
        members: membersToInclude,
        createdAt: serverTimestamp(),
      });
      setSplitwiseError(null);
      return docRef.id; // Return the ID of the newly created group
    } catch (error) {
      console.error('Error creating group:', error);
      setSplitwiseError(`Failed to create group: ${error.message}`);
      return false;
    }
  }, [currentUser]);

  // --- Function to add a member to a group ---
  const addGroupMember = useCallback(async (groupId, newMemberEmail) => {
    try {
      // Find the user ID based on email
      const usersRef = collection(db, 'userProfiles');
      const q = query(usersRef, where('email', '==', newMemberEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setSplitwiseError(`User with email "${newMemberEmail}" not found.`);
        return false;
      }

      const newMember = querySnapshot.docs[0].data();
      const newMemberUid = newMember.uid;

      if (!newMemberUid) {
        setSplitwiseError('Could not retrieve UID for the new member.');
        return false;
      }

      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(newMemberUid),
      });
      setSplitwiseError(null);
      return true;
    } catch (error) {
      console.error('Error adding group member:', error);
      setSplitwiseError(`Failed to add member: ${error.message}`);
      return false;
    }
  }, []);

  // --- Function to remove a member from a group ---
  const removeGroupMember = useCallback(async (groupId, memberUidToRemove) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        members: arrayRemove(memberUidToRemove),
      });
      setSplitwiseError(null);
      return true;
    } catch (error) {
      console.error('Error removing group member:', error);
      setSplitwiseError(`Failed to remove member: ${error.message}`);
      return false;
    }
  }, []);

  // --- Function to delete a group and all its expenses ---
  const deleteGroup = useCallback(async (groupId) => {
    try {
      const batch = writeBatch(db);

      // 1. Delete all shared expenses associated with the group
      const expensesQuery = query(collection(db, 'sharedExpenses'), where('groupId', '==', groupId));
      const expensesSnapshot = await getDocs(expensesQuery);
      expensesSnapshot.forEach((expDoc) => {
        batch.delete(expDoc.ref);
      });

      // 2. Delete the group document itself
      const groupRef = doc(db, 'groups', groupId);
      batch.delete(groupRef);

      await batch.commit();
      setSplitwiseError(null);
      return true;
    } catch (error) {
      console.error('Error deleting group and expenses:', error);
      setSplitwiseError(`Failed to delete group: ${error.message}`);
      return false;
    }
  }, []);

  // --- Function to add a shared expense ---
  const addSharedExpense = useCallback(async (groupId, description, amount, paidBy, participants, splitMethod = 'equal', exactAmounts = {}) => {
    if (!currentUser) {
      setSplitwiseError('No user logged in to add an expense.');
      return false;
    }
    try {
      await addDoc(collection(db, 'sharedExpenses'), {
        groupId,
        description: description.trim(),
        amount: parseFloat(amount),
        paidBy,
        participants,
        splitMethod,
        exactAmounts, // Store exact amounts if split method is 'exact'
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setSplitwiseError(null);
      return true;
    } catch (error) {
      console.error('Error adding shared expense:', error);
      setSplitwiseError(`Failed to add expense: ${error.message}`);
      return false;
    }
  }, [currentUser]);

  // --- Function to delete a shared expense ---
  const deleteSharedExpense = useCallback(async (expenseId) => {
    try {
      const expenseRef = doc(db, 'sharedExpenses', expenseId);
      await deleteDoc(expenseRef);
      setSplitwiseError(null);
      return true;
    } catch (error) {
      console.error('Error deleting shared expense:', error);
      setSplitwiseError(`Failed to delete expense: ${error.message}`);
      return false;
    }
  }, []);

  // --- Function to update a shared expense ---
  const updateSharedExpense = useCallback(async (expenseId, updatedFields) => {
    try {
      const expenseRef = doc(db, 'sharedExpenses', expenseId);
      await updateDoc(expenseRef, updatedFields);
      setSplitwiseError(null);
      return true;
    } catch (error) {
      console.error('Error updating shared expense:', error);
      setSplitwiseError(`Failed to update expense: ${error.message}`);
      return false;
    }
  }, []);

  // --- Function to record a payment (e.g., A paid B) ---
  const recordPayment = useCallback(async (groupId, payerUid, payeeUid, amount) => {
    if (!currentUser) {
      setSplitwiseError('No user logged in to record payment.');
      return false;
    }
    try {
      await addDoc(collection(db, 'sharedExpenses'), { // Store payments as a type of expense
        groupId,
        description: `Payment from ${groupMembersDetails[payerUid] || 'Unknown'} to ${groupMembersDetails[payeeUid] || 'Unknown'}`,
        amount: parseFloat(amount),
        paidBy: payerUid,
        participants: [payeeUid], // Only the payee "benefits" from this payment in a simplistic model
        splitMethod: 'exact',
        exactAmounts: { [payeeUid]: parseFloat(amount) }, // Payee receives the exact amount
        isPayment: true, // Mark as a payment for easier identification
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setSplitwiseError(null);
      return true;
    } catch (error) {
      console.error('Error recording payment:', error);
      setSplitwiseError(`Failed to record payment: ${error.message}`);
      return false;
    }
  }, [currentUser, groupMembersDetails]);


  // --- Effect to fetch shared expenses for a specific group ---
  const fetchSharedExpensesForGroup = useCallback((groupId) => {
    if (!groupId) {
      setCurrentGroupExpenses([]);
      setLoadingCurrentGroupExpenses(false);
      return;
    }

    setLoadingCurrentGroupExpenses(true);
    setSplitwiseError(null);
    const q = query(
      collection(db, 'sharedExpenses'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedExpenses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
        }));
        setCurrentGroupExpenses(fetchedExpenses);
        setLoadingCurrentGroupExpenses(false);
      },
      (error) => {
        console.error('Error fetching shared expenses:', error);
        setSplitwiseError(`Failed to fetch shared expenses: ${error.message}`);
        setLoadingCurrentGroupExpenses(false);
      }
    );
    return unsubscribe;
  }, []); // No dependencies here means it won't re-create unnecessarily


  // --- Utility to calculate group balances (remains the same) ---
  const calculateGroupBalances = useCallback((expenses, members) => {
    const balances = {};
    members.forEach(memberId => {
      balances[memberId] = 0; // Initialize balance for all members
    });

    expenses.forEach(expense => {
      if (expense.isPayment) {
        // For payments, payer's balance decreases, payee's increases
        balances[expense.paidBy] -= expense.amount;
        // The participant (payee) effectively receives the money, so their balance increases.
        // Assuming only one participant for payments
        if (expense.participants && expense.participants.length > 0) {
            balances[expense.participants[0]] += expense.amount;
        }
        return; // Skip normal expense logic for payments
      }


      const { amount, paidBy, participants, splitMethod, exactAmounts } = expense;
      const validParticipants = participants.filter(p => members.includes(p));

      if (validParticipants.length === 0) {
        console.warn(`Expense ${expense.id} has no valid participants. Skipping.`);
        return;
      }

      // The person who paid
      balances[paidBy] += amount;

      if (splitMethod === 'equal') {
        const share = amount / validParticipants.length;
        validParticipants.forEach(memberId => {
          balances[memberId] -= share;
        });
      } else if (splitMethod === 'exact') {
        validParticipants.forEach(memberId => {
          const exactShare = exactAmounts[memberId] || 0;
          balances[memberId] -= exactShare;
        });
      }
    });

    return balances;
  }, []);

  // --- Effect to update group balances when expenses or group members change ---
  useEffect(() => {
    if (currentGroupExpenses.length > 0 || groups.length > 0) {
        const currentSelectedGroup = groups.find(g =>
            currentGroupExpenses.length > 0 && g.id === currentGroupExpenses[0].groupId
        );

        if (currentSelectedGroup && currentSelectedGroup.members.length > 0) {
            const calculated = calculateGroupBalances(currentGroupExpenses, currentSelectedGroup.members);
            setGroupBalances(calculated);
        } else if (currentGroupExpenses.length === 0) {
            // If no expenses for the current group, but we have groups overall
            // This path needs careful consideration: do we want balances for *all* members across all groups,
            // or just the members of the *current* group (which is now empty)?
            // For a group dashboard, perhaps the first group's members? Or just clear it.
            // For now, if no expenses, and no specific group selected via expenses, clear balances.
            setGroupBalances({}); // Clear balances if no current group expenses
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
    updateSharedExpense,
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