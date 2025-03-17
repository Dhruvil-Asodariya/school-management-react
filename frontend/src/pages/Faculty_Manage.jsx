import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Button from "../components/Button";
import Reg_Title from "../components/Reg_Title";
import axios from "axios";

const FacultyManage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);

  // Fetch Faculty Data
  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8081/faculty");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching Faculty:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare Faculty Data for Table
  const faculty = data.map((faculty) => ({
    id: faculty.faculty_id,
    profile:faculty.image,
    name: `${faculty.first_name} ${faculty.last_name}`,
    email: faculty.email,
    mobile: faculty.phone_no,
    gender: faculty.gender,
    education: faculty.qualification,
    subject: faculty.subject,
    joinDate: faculty.join_date,
  }));

  // Table Columns
  const columns = [
    { name: "Profile", selector: (row) => <img src={row.profile} className="w-10 h-10 rounded-full" alt="Profile" />, sortable: false },
    { name: "Sr No.", selector: (row, index) => index + 1, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Mobile", selector: (row) => row.mobile, sortable: true },
    { name: "Gender", selector: (row) => row.gender, sortable: true },
    { name: "Education", selector: (row) => row.education, sortable: true },
    { name: "Subject", selector: (row) => row.subject, sortable: true },
    { name: "Join Date", selector: (row) => row.joinDate, sortable: true },
    {
      name: "Action",
      cell: () => (
        <div className="flex space-x-3">
          <button
            className="text-blue-600 hover:text-blue-800"
          >
            <FaEdit />
          </button>
          <button className="text-red-600 hover:text-red-800">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  // Filter Faculty Data
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
          className="text-gray-100"
        />
      </div>
    </div>
  );
};

export default FacultyManage;
