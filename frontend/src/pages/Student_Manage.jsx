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
  const [classes, setClasses] = useState([]);
  const [editStudent, setEditStudent] = useState(null); // ✅ Holds the selected student for editing

  // Fetch Students
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

  // ✅ Open Edit Modal
  const handleEditClick = (student) => {
    setEditStudent(student);
  };

  // ✅ Handle Form Submission for Editing
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    console.log("Updating student with data:", editStudent); // Debugging
  
    try {
      const response = await axios.put(`http://localhost:8081/student/${editStudent.id}`, {
        firstName: editStudent.firstName,
        lastName: editStudent.lastName,
        phone_number: editStudent.phone_number,
        emr_phone_number: editStudent.emr_phone_number,
        dob: editStudent.dob || null,  // Ensure correct date format
        address: editStudent.address,
        gender: editStudent.gender,
        class_id: editStudent.class, // Ensure correct key
      });
  
      Swal.fire({
        title: "Updated!",
        text: response.data.message || "Student details have been updated.",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });
  
      fetchData();
      setEditStudent(null);
    } catch (error) {
      console.error("Error updating student:", error.response?.data || error.message);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.error || "Failed to update student details.",
        icon: "error",
        timer: 1000,
        showConfirmButton: false,
      });
    }
  };
  

  //Delete Student
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
        Swal.fire({
          title: "Deleted!",
          text: "The student has been deleted.",
          icon: "success",
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        fetchData();
      } catch (error) {
        console.error("Error deleting student:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete the student.",
          icon: "error",
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    }
  };

  // 🔹 Fetch class options from the database
    useEffect(() => {
      axios
        .get("http://localhost:8081/class") // ✅ Adjust this to your actual API endpoint
        .then((response) => {
          setClasses(response.data); // ✅ Save fetched classes in state
        })
        .catch((error) => {
          console.error("Error fetching classes:", error);
        });
    }, []);

  const students = data.map((student) => ({
    id: student.student_id,
    profile: student.image,
    firstName: student.first_name,
    lastName: student.last_name,
    email: student.email,
    gender: student.gender,
    dob: student.date_of_birth,
    phone_number: student.phone_no,
    emr_phone_number: student.emrNumber,
    address: student.address,
    class: student.class_id,
    admissionDate: student.admission_date,
  }));

  const columns = [
    { name: "Profile", selector: (row) => <img src={row.profile} className="w-10 h-10 rounded-full" alt="Profile" />, sortable: false },
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
          <button onClick={() => handleEditClick(row)} className="text-blue-600 hover:text-blue-800">
            <FaEdit />
          </button>
          <button onClick={() => handleDeleteClick(row.id)} className="text-red-600 hover:text-red-800">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const filteredStudent = students.filter((faculty) =>
    Object.values(faculty).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6 bg-gray-100">
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
          data={filteredStudent}
          pagination
          highlightOnHover
          striped
          responsive
        />
      </div>

      {editStudent && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Student</h2>
            <form onSubmit={handleUpdateStudent}>
              {/* First Name */}
              <input
                type="text"
                className="w-full p-2 border rounded mb-2"
                placeholder="First Name"
                value={editStudent.firstName}
                onChange={(e) => setEditStudent({ ...editStudent, firstName: e.target.value })}
              />

              {/* Last Name */}
              <input
                type="text"
                className="w-full p-2 border rounded mb-2"
                placeholder="Last Name"
                value={editStudent.lastName}
                onChange={(e) => setEditStudent({ ...editStudent, lastName: e.target.value })}
              />

              {/* Phone Number */}
              <input
                type="text"
                className="w-full p-2 border rounded mb-2"
                placeholder="Phone Number"
                value={editStudent.phone_number}
                onChange={(e) => setEditStudent({ ...editStudent, phone_number: e.target.value })}
              />

              {/* Emergency Phone Number */}
              <input
                type="text"
                className="w-full p-2 border rounded mb-2"
                placeholder="Emergency Phone Number"
                value={editStudent.emr_phone_number}
                onChange={(e) => setEditStudent({ ...editStudent, emr_phone_number: e.target.value })}
              />

              {/* Address */}
              <textarea
                className="w-full p-2 border rounded mb-2"
                placeholder="Address"
                value={editStudent.address}
                onChange={(e) => setEditStudent({ ...editStudent, address: e.target.value })}
              ></textarea>

              {/* Gender */}
              <select
                className="w-full p-2 border rounded mb-2"
                value={editStudent.gender}
                onChange={(e) => setEditStudent({ ...editStudent, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              {/* Class */}
              <select
                className="w-full p-2 border rounded mb-2"
                value={editStudent.class}
                onChange={(e) => setEditStudent({ ...editStudent, class: e.target.value })}
              >
                <option value="">Choose...</option>
                {classes.map((cls) => (
                  <option key={cls.class} value={cls.class}>
                    {cls.class_name}
                  </option>
                ))}
                {/* Add more class options dynamically if needed */}
              </select>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-4">
                <button type="button" onClick={() => setEditStudent(null)} className="px-4 py-2 bg-gray-400 text-white rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
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

export default StudentManage;