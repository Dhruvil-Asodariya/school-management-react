import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Button from "../components/Button";
import Reg_Title from "../components/Reg_Title";
import axios from "axios";
import Swal from "sweetalert2";

const FacultyManage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [editFaculty, setEditFaculty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const subjectOptions = ["Math", "Science", "English", "History", "Physics", "Chemistry", "Biology"]; // List of available subjects

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
    profile: faculty.image,
    name: `${faculty.first_name} ${faculty.last_name}`,
    email: faculty.email,
    mobile: faculty.phone_no,
    gender: faculty.gender,
    education: faculty.qualification,
    subject: faculty.subject ? faculty.subject.split(",") : [], // Convert subject string to array
    joinDate: faculty.join_date,
  }));

  // Open Edit Modal
  const handleEdit = (faculty) => {
    setEditFaculty(faculty);
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditFaculty(null);
  };

  // Handle Input Change
  const handleChange = (e) => {
    setEditFaculty({ ...editFaculty, [e.target.name]: e.target.value });
  };

  // Handle Subject Checkbox Change
  const handleSubjectChange = (subject) => {
    const updatedSubjects = editFaculty.subject.includes(subject)
      ? editFaculty.subject.filter((s) => s !== subject) // Remove if already selected
      : [...editFaculty.subject, subject]; // Add if not selected

    setEditFaculty({ ...editFaculty, subject: updatedSubjects });
  };

  // Update Faculty
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8081/faculty/${editFaculty.id}`, {
        ...editFaculty,
        subject: editFaculty.subject.join(","), // Convert subject array to string
      });
      Swal.fire({
        title: "Updated!",
        text: "Faculty details have been updated.",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });
      fetchData(); // Refresh data
      handleCloseModal(); // Close modal
    } catch (error) {
      console.error("Error updating faculty:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update faculty details.",
        icon: "error",
        timer: 1000,
        showConfirmButton: false,
      });
    }
  };

  // Delete Faculty
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8081/faculty/${id}`);
          Swal.fire({
            title: "Deleted!",
            text: "Faculty member has been deleted.",
            icon: "success",
            timer: 1000, // Auto close after 1 second
            showConfirmButton: false,
          });
          fetchData(); // Refresh the data after deletion
        } catch (error) {
          console.error("Error deleting faculty:", error);
          Swal.fire({
            title: "Error!",
            text: "Failed to delete faculty member.",
            icon: "error",
            timer: 1000, // Auto close after 1 second
            showConfirmButton: false,
          });
        }
      }
    });
  };


  // Table Columns
  const columns = [
    { name: "Profile", selector: (row) => <img src={row.profile} className="w-10 h-10 rounded-full" alt="Profile" />, sortable: false },
    { name: "Sr No.", selector: (row, index) => index + 1, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Mobile", selector: (row) => row.mobile, sortable: true },
    { name: "Gender", selector: (row) => row.gender, sortable: true },
    { name: "Education", selector: (row) => row.education, sortable: true },
    { name: "Subject", selector: (row) => row.subject.join(", "), sortable: true },
    { name: "Join Date", selector: (row) => row.joinDate, sortable: true },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex space-x-3">
          <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(row)}>
            <FaEdit />
          </button>
          <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(row.id)}>
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

      {/* Edit Faculty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Faculty</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-2">
                <label className="block text-sm font-medium">Name</label>
                <input type="text" name="name" value={editFaculty.name} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Mobile</label>
                <input type="text" name="mobile" value={editFaculty.mobile} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Gender</label>
                <select name="gender" value={editFaculty.gender} onChange={handleChange} className="w-full border px-3 py-2 rounded" required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Education</label>
                <input type="text" name="education" value={editFaculty.education} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Subjects</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {subjectOptions.map((subject) => (
                    <label key={subject} className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFaculty.subject.includes(subject)}
                        onChange={() => handleSubjectChange(subject)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManage;
