import React from "react";

interface GroupExpense {
  name?: string;
  members: string[];
  totalPayments?: number;
  lastActivity?: number;
}

interface GroupExpensesTableProps {
  groupExpenses: GroupExpense[];
}

const GroupExpensesTable: React.FC<GroupExpensesTableProps> = ({
  groupExpenses,
}) => {
  return Array.isArray(groupExpenses) &&
    groupExpenses.some(
      (group) => Array.isArray(group.members) && group.members.length > 0
    ) ? (
    <table className="table-auto -ml-40 w-full mt-5 border">
      <thead>
        <tr>
          <th className="px-4 py-2 border">Group Name</th>
          <th className="px-4 py-2 border">Members</th>
          <th className="px-4 py-2 border">Balance</th>
          <th className="px-4 py-2 border">Last Activity</th>
        </tr>
      </thead>
      <tbody>
        {groupExpenses
          .filter(
            (group) => Array.isArray(group.members) && group.members.length > 0
          )
          .map((group, index) => (
            <tr className="bg-white bg-opacity-[50%]" key={index}>
              <td className="px-4 py-2 border">{group.name || "N/A"}</td>
              <td className="px-4 py-2 border">{group.members.join(", ")}</td>
              <td className="px-4 py-2 border">
                {group.totalPayments !== undefined
                  ? group.totalPayments
                  : "N/A"}
              </td>
              <td className="px-4 py-2 border">
                {group.lastActivity
                  ? new Date(group.lastActivity * 1000).toLocaleDateString()
                  : "N/A"}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  ) : (
    <p className="mt-5">No group expenses found.</p>
  );
};

export default GroupExpensesTable;
