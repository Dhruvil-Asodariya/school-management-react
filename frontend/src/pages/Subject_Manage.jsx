// import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "../components/Button";
import { useEffect, useState } from "react";
import axios from "axios";

const Subject_Manage = () => {
  const [data, setData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSubject, setEditSubject] = useState(null);

  // ✅ Function to Fetch Data from Backend
  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8081/subject");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  // ✅ Fetch Data When Component Mounts
  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Validation Schema
  const validationSchema = Yup.object({
    subjectName: Yup.string().required("Please Enter Subject name"),
  });

  // ✅ Formik for Adding Subject
  const formik = useFormik({
    initialValues: {
      subjectName: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.post("http://localhost:8081/subject", {
          subjectName: values.subjectName,
        });

        Swal.fire({
          title: "Success!",
          text: "New subject successfully added",
          icon: "success",
          timer: 1000,
          showConfirmButton: true,
          timerProgressBar: true,
        }).then(() => {
          formik.resetForm();
          fetchData();
        });

      } catch (error) {
        console.error("Error adding subject:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to add subject",
          icon: "error",
          showConfirmButton: true,
        });
      }
    },
  });

  // ✅ Open Edit Modal
  const handleEditClick = (subject) => {
    setEditSubject(subject);
    setIsEditModalOpen(true);
  };

  // ✅ Formik for Editing Subject
  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      subjectName: editSubject?.subject_name || "", // Ensure correct field mapping
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.put(`http://localhost:8081/subject/${editSubject.subject_id}`, { subjectName: values.subjectName });

        Swal.fire({
          title: "Updated!",
          text: "Subject updated successfully",
          icon: "success",
          timer: 1000,
          showConfirmButton: true,
          timerProgressBar: true,
        }).then(() => {
          setIsEditModalOpen(false);
          fetchData();
        });

      } catch (error) {
        console.error("Error updating subject:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to update subject",
          icon: "error",
          showConfirmButton: true,
        });
      }
    },
  });

  const handleDeleteClick = async (subjectId) => {
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
        await axios.delete(`http://localhost:8081/subject/${subjectId}`);
        Swal.fire("Deleted!", "The subject has been deleted.", "success");
        fetchData(); // Refresh data after deletion
      } catch (error) {
        console.error("Error deleting subject:", error);
        Swal.fire("Error!", "Failed to delete the subject.", "error");
      }
    }
  };

  return (
    <div className="p-6 flex flex-row max-w-full justify-between gap-6">
      {/* Add Subject */}
      <div className="bg-white shadow-md rounded-lg p-6 w-1/2">
        <h2 className="text-xl font-bold mb-4">Add Subject</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Subject Name</label>
            <input
              type="text"
              name="subjectName"
              className="mt-1 p-2 border rounded w-full focus:outline-sky-500"
              {...formik.getFieldProps("subjectName")}
            />
            {formik.touched.subjectName && formik.errors.subjectName && (
              <span className="text-red-500 text-sm">
                {formik.errors.subjectName}
              </span>
            )}
          </div>
          <Button name="Add Subject" />
        </form>
      </div>

      {/* Subject List */}
      <div className="bg-white shadow-md rounded-lg p-6 w-1/2">
        <h2 className="text-xl font-bold mb-4">Subject List</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-blue-600">
                <th className="px-4 py-2 text-white">Sr No.</th>
                <th className="px-4 py-2 text-white">Subject Name</th>
                <th className="px-4 py-2 text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((subject, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-center">{index + 1}</td>
                    <td className="px-4 py-2 text-center">{subject.subject_name}</td>
                    <td className="px-4 py-2 space-x-4 text-center">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditClick(subject)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteClick(subject.subject_id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4">No subjects available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Subject</h2>
            <form onSubmit={editFormik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Subject Name</label>
                <input
                  type="text"
                  name="subjectName"
                  className="mt-1 p-2 border rounded w-full focus:outline-sky-500"
                  {...editFormik.getFieldProps("subjectName")}
                />
                {editFormik.touched.subjectName && editFormik.errors.subjectName && (
                  <span className="text-red-500 text-sm">
                    {editFormik.errors.subjectName}
                  </span>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <Button name="Update Subject" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subject_Manage;
