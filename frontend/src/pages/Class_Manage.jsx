// import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "../components/Button";
import { useEffect, useState } from "react";
import axios from "axios";


const Class = () => {
  // const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editClass, setEditClass] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8081/class");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  // ✅ Fetch Data When Component Mounts
  useEffect(() => {
    fetchData();
  }, []);

  const validationSchema = Yup.object({
    className: Yup.string().required("Please Enter Class name"),
  });

  const formik = useFormik({
    initialValues: {
      className: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.post("http://localhost:8081/class", {
          className: values.className,
        });

        Swal.fire({
          title: "Success!",
          text: "New class successfully added",
          icon: "success",
          timer: 1000,
          showConfirmButton: true,
          timerProgressBar: true,
        }).then(() => {
          formik.resetForm();
          fetchData();
        });

      } catch (error) {
        console.error("Error adding class:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to add class",
          icon: "error",
          showConfirmButton: true,
        });
      }
    },
  });

  // Update Class
  // ✅ Open Edit Modal
  const handleEditClick = (classItem) => {
    setEditClass(classItem);
    setIsEditModalOpen(true);
  };

  // ✅ Formik for Editing Subject
  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      className: editClass?.class_name || "", // Ensure correct field mapping
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.put(`http://localhost:8081/class/${editClass.class_id}`, { className: values.className });

        Swal.fire({
          title: "Updated!",
          text: "Class updated successfully",
          icon: "success",
          timer: 1000,
          showConfirmButton: true,
          timerProgressBar: true,
        }).then(() => {
          setIsEditModalOpen(false);
          fetchData();
        });

      } catch (error) {
        console.error("Error updating class:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to update class",
          icon: "error",
          timer: 1000,
          showConfirmButton: true,
        });
      }
    },
  });

  //Delete Subject
  const handleDeleteClick = async (classId) => {
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
        await axios.delete(`http://localhost:8081/class/${classId}`);
        Swal.fire({
          title: "Deleted!",
          text: "The class has been deleted.",
          icon: "success",
          timer: 1000, // 1-second timer
          showConfirmButton: false
        });
        fetchData(); // Refresh data after deletion
      } catch (error) {
        console.error("Error deleting subject:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete the class.",
          icon: "error",
          timer: 1000, // 1-second timer
          showConfirmButton: false
        });
      }
    }    
  };

  return (
    <div className="p-6 flex flex-row max-w-full justify-between gap-6">
      <div className="bg-white shadow-md rounded-lg p-6 w-1/2">
        <h2 className="text-xl font-bold mb-4">Add Class</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Class Name</label>
            <input
              type="text"
              name="className"
              className="mt-1 p-2 border rounded w-full focus:outline-sky-500"
              {...formik.getFieldProps("className")}
            />
            {formik.touched.className && formik.errors.className && (
              <span className="text-red-500 text-sm">
                {formik.errors.className}
              </span>
            )}
          </div>
          <Button name="Add Class" />
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 w-1/2">
        <h2 className="text-xl font-bold mb-4">Class List</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-blue-600">
                <th className="px-4 py-2 text-white">Sr No.</th>
                <th className="px-4 py-2 text-white">Class Name</th>
                <th className="px-4 py-2 text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((Class, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-center">{index + 1}</td>
                    <td className="px-4 py-2 text-center">{Class.class_name}</td>
                    <td className="px-4 py-2 space-x-4 text-center">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditClick(Class)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteClick(Class.class_id)}
                      >
                        <FaTrash />
                      </button> 
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4">No classes available</td>
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
                  name="className"
                  className="mt-1 p-2 border rounded w-full focus:outline-sky-500"
                  {...editFormik.getFieldProps("className")}
                />
                {editFormik.touched.className && editFormik.errors.className && (
                  <span className="text-red-500 text-sm">
                    {editFormik.errors.className}
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

export default Class;