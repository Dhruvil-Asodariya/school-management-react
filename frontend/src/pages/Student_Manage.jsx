import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
// import { useState } from "react";
import DataTable from "react-data-table-component";
import Button from "../components/Button";
import Reg_Title from "../components/Reg_Title";
import { useEffect, useState } from "react";
import axios from "axios";

const StudentManage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8081/student");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching Student:", err);
    }
  };

  // ✅ Fetch Data When Component Mounts
  useEffect(() => {
    fetchData();
  }, []);

  console.log(data);

  // Sample Student Data
  const students = data.map((student, index) => ({
    id: index,
    profile: student.image,
    rollNo: student.roll_no,
    firstName: student.first_name,
    lastName: student.last_name,
    email: student.email,
    gender: student.gender,
    phone_number: student.phone_number,
    class: student.class_id,
    admissionDate: student.admission_date,
  }));

  // Table Columns
  const columns = [
    { name: "Profile", selector: (row) => <img src={row.profile} className="w-12 h-12 rounded-full" alt="Profile" />, sortable: false },
    { name: "Roll No", selector: (row) => row.rollNo, sortable: true },
    { name: "First Name", selector: (row) => row.firstName, sortable: true },
    { name: "Last Name", selector: (row) => row.lastName, sortable: true },
    { name: "Email", selector: (row) => <div title={row.email} className="overflow-hidden"> {row.email} </div>, sortable: true },
    { name: "Gender", selector: (row) => row.gender, sortable: true },
    { name: "Mobile", selector: (row) => row.phone_number, sortable: true },
    { name: "Class", selector: (row) => row.class, sortable: true },
    { name: "Admission Date", selector: (row) => <div title={row.admissionDate} className="overflow-hidden"> {row.admissionDate} </div>, sortable: true },
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

  // Filter Students
  const filteredStudents = students.filter((student) =>
    Object.values(student).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <Reg_Title name="All Students List" />

      {/* Search Input */}
      <div className="mb-6 flex justify-between items-center">
        <Link to="/add_student">
          <Button name="+ Add Student" />
        </Link>
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 border rounded   focus:ring focus:ring-blue-300 focus:outline-sky-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredStudents}
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

export default StudentManage;
