import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "../components/Button";
import { useEffect, useState } from "react";
import axios from "axios";

const ManageNote = () => {
 
  const [data, setData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNote, setEditSubject] = useState(null);


  const validationSchema = Yup.object({
    noteContent: Yup.string().required("Please Enter Note Content"),
  });

   // Add Subject
  // ✅ Formik for Adding Subject
  const formik = useFormik({
    initialValues: {
      noteContent: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.post("http://localhost:8081/note", {
          noteContent: values.noteContent,
        });

        Swal.fire({
          title: "Success!",
          text: "New note successfully added",
          icon: "success",
          timer: 1000,
          showConfirmButton: true,
          timerProgressBar: true,
        }).then(() => {
          formik.resetForm();
          fetchData();
        });

      } catch (error) {
        console.error("Error adding note:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to add note",
          icon: "error",
          timer: 1000,
          showConfirmButton: true,
        });
      }
    },
  });

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8081/note");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  // ✅ Fetch Data When Component Mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Update Note
  // ✅ Open Edit Modal
  const handleEditClick = (note) => {
    setEditSubject(note);
    setIsEditModalOpen(true);
  };

  // ✅ Formik for Editing Subject
  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      noteContent: editNote?.note_content || "", // Ensure correct field mapping
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.put(`http://localhost:8081/note/${editNote.note_id}`, { noteContent: values.noteContent });

        Swal.fire({
          title: "Updated!",
          text: "Note updated successfully",
          icon: "success",
          timer: 1000,
          showConfirmButton: true,
          timerProgressBar: true,
        }).then(() => {
          setIsEditModalOpen(false);
          fetchData();
        });

      } catch (error) {
        console.error("Error updating note:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to update note  ",
          icon: "error",
          showConfirmButton: true,
        });
      }
    },
  });

  //Delete Note
  const handleDeleteClick = async (noteId) => {
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
        await axios.delete(`http://localhost:8081/note/${noteId}`);
        Swal.fire("Deleted!", "The note has been deleted.", "success");
        fetchData(); // Refresh data after deletion
      } catch (error) {
        console.error("Error deleting note:", error);
        Swal.fire("Error!", "Failed to delete the note.", "error");
      }
    }
  };

  return (
    <div className="p-6 flex flex-row max-w-full justify-between gap-6">
      <div className="bg-white shadow-md rounded-lg p-6 w-1/2">
        <h2 className="text-xl font-bold mb-4">Add Note</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Note Content</label>
            <textarea
              name="noteContent"
              className="mt-1 p-2 border rounded w-full focus:outline-sky-500"
              rows="4"
              {...formik.getFieldProps("noteContent")}
            ></textarea>
            {formik.touched.noteContent && formik.errors.noteContent && (
              <span className="text-red-500 text-sm">
                {formik.errors.noteContent}
              </span>
            )}
          </div>

          <Button name="Add Note" />
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 w-1/2">
        <h2 className="text-xl font-bold mb-4">Note List</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-blue-600">
                <th className="px-4 py-2 text-white">Sr No.</th>
                <th className="px-4 py-2 text-white">Note Content</th>
                <th className="px-4 py-2 text-white">Action</th>
              </tr>
            </thead>
            <tbody>
            {data.length > 0 ? (
                data.map((note, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-center">{index + 1}</td>
                    <td className="px-4 py-2 text-center">{note.note_content}</td>
                    <td className="px-4 py-2 space-x-4 text-center">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditClick(note)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteClick(note.note_id)}
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
                <label className="block text-sm font-medium">Note Content</label>
                <input
                  type="text"
                  name="noteContent"
                  className="mt-1 p-2 border rounded w-full focus:outline-sky-500"
                  {...editFormik.getFieldProps("noteContent")}
                />
                {editFormik.touched.noteContent && editFormik.errors.noteContent && (
                  <span className="text-red-500 text-sm">
                    {editFormik.errors.noteContent}
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
                <Button name="Update Note" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNote;
