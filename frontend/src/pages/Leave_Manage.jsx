import { useState } from "react";
import DataTable from "react-data-table-component";

const Leave_Manage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveData, setLeaveData] = useState([
    {
      id: 1,
      fullName: "Virani Jaydeep",
      email: "jvirani820@rku.ac.in",
      reason: "Leave Demo",
      days: 1,
      appliedOn: "2023-02-04",
      role: "Student",
      status: true,
    },
    {
      id: 2,
      fullName: "Virani Jaydeep",
      email: "jaydeepvirani677@gmail.com",
      reason: "Faculty Leave",
      days: 2,
      appliedOn: "2023-02-04",
      role: "Faculty",
      status: false,
    },
  ]);

  // Table Columns
  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: true },
    { name: "Full Name", selector: (row) => row.fullName, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Leave Reason", selector: (row) => row.reason, sortable: true },
    { name: "Leave Days", selector: (row) => row.days, sortable: true },
    { name: "Applied On", selector: (row) => row.appliedOn, sortable: true },
    { name: "Role", selector: (row) => row.role, sortable: true },
    {
      name: "Status",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={row.status}
              onChange={() => {
                const updatedLeaveData = leaveData.map((item) =>
                  item.id === row.id ? { ...item, status: !item.status } : item
                );
                setLeaveData(updatedLeaveData);
              }}
            />
            <div
              className={`relative w-11 h-6 rounded-full peer dark:bg-gray-700 peer-focus:ring-4
              ${row.status ? 'bg-green-600 peer-checked:bg-green-600 border-green-600 peer-focus:ring-green-300 dark:peer-focus:ring-green-800' : 'bg-red-600 peer-checked:bg-red-600 border-red-600 peer-focus:ring-red-300 dark:peer-focus:ring-red-800'}
              peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}
            ></div>
          </label>
          <span
            className={`text-sm font-medium ${row.status ? 'text-green-600' : 'text-red-600'}`}
          >
            {row.status ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "rgb(37, 99, 245)",
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: "14px",
        textAlign: "left",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        "&:hover": {
          backgroundColor: "#f3f4f6",
        },
      },
    },
  };

  // Filter Leave Data
  const filteredLeaves = leaveData.filter((leave) =>
    Object.values(leave).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">All Leave Requests</h2>
      </div>

      {/* Search Input */}
      <div className="mb-6 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 border rounded focus:ring focus:ring-blue-300 focus:outline-sky-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredLeaves}
          pagination
          highlightOnHover
          striped
          responsive
          customStyles={customStyles}
          className="text-gray-100"
        />
      </div>
    </div>
  );
};

export default Leave_Manage;
