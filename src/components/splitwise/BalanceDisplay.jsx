import React from 'react';

function BalanceDisplay({ groupBalances, groupMembersDetails }) {

  const getMemberName = (uid) => groupMembersDetails[uid] || `User-${uid.substring(0, 4)}`;

  // Filter out members with zero balance and sort for consistent display
  const activeBalances = Object.entries(groupBalances)
    .filter(([, balance]) => Math.abs(balance) > 0.01) // Filter out negligible balances
    .sort(([, a], [, b]) => a - b); // Sort to show who owes first

  if (activeBalances.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Balances</h2>
        <p className="text-gray-600">Everyone is settled up!</p>
      </div>
    );
  }

  // Logic to simplify debts (optional but good for UX, e.g., A owes B 10, C owes B 5 -> A and C pay B)
  // This is a simplified settlement algorithm. For complex scenarios, dedicated libraries are better.
  const calculateSettlements = (balances) => {
    const debtors = []; // Owe money (negative balance)
    const creditors = []; // Are owed money (positive balance)

    for (const [uid, amount] of Object.entries(balances)) {
      if (amount < 0) {
        debtors.push({ uid, amount: -amount }); // Store as positive debt
      } else if (amount > 0) {
        creditors.push({ uid, amount });
      }
    }

    debtors.sort((a, b) => b.amount - a.amount); // Largest debt first
    creditors.sort((a, b) => b.amount - a.amount); // Largest credit first

    const settlements = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const settlementAmount = Math.min(debtor.amount, creditor.amount);

      if (settlementAmount > 0.01) { // Only add if significant
        settlements.push({
          from: debtor.uid,
          to: creditor.uid,
          amount: settlementAmount,
        });

        debtor.amount -= settlementAmount;
        creditor.amount -= settlementAmount;
      }

      if (debtor.amount < 0.01) { // Debtor settled
        i++;
      }
      if (creditor.amount < 0.01) { // Creditor settled
        j++;
      }
    }
    return settlements;
  };

  const settlements = calculateSettlements(groupBalances);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Balances</h2>
      {settlements.length === 0 && activeBalances.length > 0 ? (
        <p className="text-gray-600">Calculating settlements...</p> // Should not happen if `activeBalances` > 0
      ) : (
        <ul className="divide-y divide-gray-200">
          {settlements.map((s, index) => (
            <li key={index} className="py-2 text-gray-700">
              <span className="font-semibold">{getMemberName(s.from)}</span> owes <span className="font-semibold">{getMemberName(s.to)}</span> ₹{s.amount.toLocaleString('en-IN')}
            </li>
          ))}
        </ul>
      )}

      {/* Optional: Display individual net balances for debugging/overview */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="text-md font-semibold mb-2 text-gray-700">Individual Net Balances:</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          {Object.entries(groupBalances).map(([uid, balance]) => (
            <li key={uid}>
              {getMemberName(uid)}: <span className={balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                ₹{balance.toLocaleString('en-IN')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default BalanceDisplay;