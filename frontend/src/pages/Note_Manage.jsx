import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "../components/Button";

const ManageNote = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    noteContent: Yup.string().required("Please Enter Note Content"),
  });

  const formik = useFormik({
    initialValues: {
      noteContent: "",
    },
    validationSchema,
    onSubmit: () => {
      Swal.fire({
        title: "Success!",
        text: "New note successfully added",
        icon: "success",
        timer: 1000,
        showConfirmButton: true,
        timerProgressBar: true,
      }).then(() => {
        formik.resetForm();  // Reset form fields after submission
        navigate("/note_manage");
      });
    },
  });

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
              <tr>
                <td className="px-4 py-2 text-center">1</td>
                <td className="px-4 py-2 text-center">Sample note content</td>
                <td className="px-4 py-2 space-x-4 text-center">
                  <Link>
                    <button className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </button>
                  </Link>
                  <Link>
                    <button className="text-red-600 hover:text-red-800">
                      <FaTrash />
                    </button>
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageNote;
