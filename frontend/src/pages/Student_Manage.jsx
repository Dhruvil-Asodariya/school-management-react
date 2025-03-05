import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import DataTable from "react-data-table-component";
import Button from "../components/Button";
import Reg_Title from "../components/Reg_Title";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const StudentManage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);

  // Get Student
  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8081/student");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching Student:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Delete Student
  const handleDeleteClick = async (studentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8081/student/${studentId}`);
        Swal.fire("Deleted!", "The student has been deleted.", "success");
        fetchData(); // Refresh data after deletion
      } catch (error) {
        console.error("Error deleting student:", error);
        Swal.fire("Error!", "Failed to delete the student.", "error");
      }
    }
  };

  const students = data.map((student) => ({
    id: student.student_id,
    profile: student.image,
    firstName: student.first_name,
    lastName: student.last_name,
    email: student.email,
    gender: student.gender,
    phone_number: student.phone_number,
    class: student.class_id,
    admissionDate: student.admission_date,
  }));

  const columns = [
    { name: "Profile", selector: (row) => <img src={row.profile} className="w-12 h-12 rounded-full" alt="Profile" />, sortable: false },
    { name: "Roll No", selector: (row, index) => index + 1, sortable: true },
    { name: "First Name", selector: (row) => row.firstName, sortable: true },
    { name: "Last Name", selector: (row) => row.lastName, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Gender", selector: (row) => row.gender, sortable: true },
    { name: "Mobile", selector: (row) => row.phone_number, sortable: true },
    { name: "Class", selector: (row) => row.class, sortable: true },
    { name: "Admission Date", selector: (row) => row.admissionDate, sortable: true },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex space-x-3">
          <button className="text-blue-600 hover:text-blue-800">
            <FaEdit />
          </button>
          <button onClick={() => handleDeleteClick(row.id)} className="text-red-600 hover:text-red-800">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Reg_Title name="All Students List" />

      <div className="mb-6 flex justify-between items-center">
        <Link to="/add_student">
          <Button name="+ Add Student" />
        </Link>
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 border rounded focus:ring focus:ring-blue-300 focus:outline-sky-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={students}
          pagination
          highlightOnHover
          striped
          responsive
        />
      </div>
    </div>
  );
};

export default StudentManage;
