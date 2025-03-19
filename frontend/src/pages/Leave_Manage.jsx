import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Reg_Title from "../components/Reg_Title";
import axios from "axios";
import Swal from "sweetalert2";

const Leave_Manage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveData, setLeaveData] = useState([]);

  // Get Leave list
  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8081/leave");
      const formattedData = res.data.map((leave) => ({
        id: leave.leave_id,
        fullName: leave.full_name,
        email: leave.email,
        reason: leave.leave_reason,
        days: leave.leave_day,
        appliedOn: leave.applyed_on,
        role: leave.role,
        status: leave.status,
      }));
      setLeaveData(formattedData);
    } catch (err) {
      console.error("Error fetching leave data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Status
  const handleStatusChange = async (id, currentStatus, email, full_name) => {
    const newStatus = currentStatus ? 0 : 1; // Convert boolean to 0 or 1
    const leave_email = email;
    const leave_full_name = full_name;
    try {
      await axios.patch(`http://localhost:8081/leave/${id}`, {
        status: newStatus,
        email: leave_email,
        fullName: leave_full_name,
      });
  
      // Update UI after a successful response
      const updatedLeaveData = leaveData.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      );
      setLeaveData(updatedLeaveData);
  
      // Show Swal success message
      Swal.fire({
        title: "Success!",
        text: `Leave status updated to ${newStatus ? "Active" : "Inactive"}.`,
        icon: "success",
        timer: 1000,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
    } catch (err) {
      console.error("Error updating leave status:", err);
  
      // Show error message if the update fails
      Swal.fire({
        title: "Error!",
        text: "Failed to update leave status.",
        icon: "error",
        timer: 1000,
        confirmButtonColor: "#d33",
        confirmButtonText: "Try Again",
      });
    }
  };
  

  const columns = [
    { name: "Sr No.", selector: (row, index) => index + 1, sortable: true },
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
              checked={row.status === 1} // Convert DB value (1 or 0) to boolean
              onChange={() => handleStatusChange(row.id, row.status, row.email, row.fullName)}
            />
            <div
              className={`relative w-11 h-6 rounded-full peer dark:bg-gray-700 peer-focus:ring-4
              ${row.status
                  ? "bg-green-600 peer-checked:bg-green-600 border-green-600 peer-focus:ring-green-300 dark:peer-focus:ring-green-800"
                  : "bg-red-600 peer-checked:bg-red-600 border-red-600 peer-focus:ring-red-300 dark:peer-focus:ring-red-800"
                }
              peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}
            ></div>
          </label>
          <span
            className={`text-sm font-medium ${row.status ? "text-green-600" : "text-red-600"
              }`}
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
      <Reg_Title name="All Leave List" />

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
