import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import DataTable from "react-data-table-component";
import Button from "../components/Button";
import Reg_Title from "../components/Reg_Title";

const FacultyManage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample Faculty Data
  const faculty = [
    {
      id: 1,
      name: "Tiger Nixon",
      education: "M.COM, P.H.D.",
      mobile: "123 456 7890",
      email: "info@example.com",
      admissionDate: "2011/04/25",
    },
    {
      id: 2,
      name: "Garrett Winters",
      education: "M.COM, P.H.D.",
      mobile: "987 654 3210",
      email: "info@example.com",
      admissionDate: "2011/07/25",
    },
    {
      id: 3,
      name: "Ashton Cox",
      education: "B.COM, M.COM.",
      mobile: "(123) 4567 890",
      email: "info@example.com",
      admissionDate: "2009/01/12",
    },
  ];

  // Table Columns
  const columns = [
    { name: "Roll No.", selector: (row, index) => index + 1, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Education", selector: (row) => row.education, sortable: true },
    { name: "Mobile", selector: (row) => row.mobile, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    {
      name: "Admission Date",
      selector: (row) => row.admissionDate,
      sortable: true,
    },
    {
      name: "Action",
      cell: () => (
        <div className="flex space-x-3">
          <button className="text-blue-600 hover:text-blue-800">
            <FaEdit />
          </button>
          <button className="text-red-600 hover:text-red-800">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "rgb(37, 99, 245)", // Blue-500 in Tailwind
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
          backgroundColor: "#f3f4f6", // Gray-100 in Tailwind
        },
      },
    },
  };

  // Filter Students
  const filteredFaculty = faculty.filter((faculty) =>
    Object.values(faculty).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <Reg_Title name="All Faculty List" />

      {/* Search Input */}
      <div className="mb-6 flex justify-between items-center">
        <Link to="/add_faculty">
        <Button name="+ Add Faculty" />
        </Link>
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
          data={filteredFaculty}
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

export default FacultyManage;