import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "../components/Button";
import { useEffect, useState } from "react";
import axios from "axios";
import Reg_Title from "../components/Reg_Title";

const Fee_Amount = () => {
  const [data, setData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [editFee, setEditFee] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8081/fee_amount");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching fee amounts:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validationSchema = Yup.object({
    className: Yup.string().required("Please enter Class Name"),
  });

  const editValidationSchema = Yup.object({
    year_fee: Yup.number()
      .typeError("Year Fee must be a number")
      .required("Please enter Year Fee")
      .positive("Year Fee must be positive"),
    exam_fee: Yup.number()
      .typeError("Exam Fee must be a number")
      .required("Please enter Exam Fee")
      .positive("Exam Fee must be positive"),
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

  const handleEditClick = (feeItem) => {
    setEditFee(feeItem);
    setIsEditModalOpen(true);
  };

  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      year_fee: editFee?.year_fee || "",
      exam_fee: editFee?.exam_fee || "",
    },
    validationSchema: editValidationSchema,
    onSubmit: async (values) => {
      try {
        await axios.put(`http://localhost:8081/fee_amount/${editFee.id}`, {
          year_fee: values.year_fee,
          exam_fee: values.exam_fee,
        });

        Swal.fire({
          title: "Updated!",
          text: "Fee amount updated successfully",
          icon: "success",
          timer: 1000,
          showConfirmButton: true,
          timerProgressBar: true,
        }).then(() => {
          setIsEditModalOpen(false);
          fetchData();
        });
      } catch (error) {
        console.error("Error updating fee amount:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to update fee amount",
          icon: "error",
          timer: 1000,
          showConfirmButton: true,
        });
      }
    },
  });

  const handleDeleteClick = async (id) => {
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
        await axios.delete(`http://localhost:8081/fee_amount/${id}`);
        Swal.fire({
          title: "Deleted!",
          text: "Fee amount deleted successfully.",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
        fetchData();
      } catch (error) {
        console.error("Error deleting fee amount:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete fee amount.",
          icon: "error",
          timer: 1000,
          showConfirmButton: false,
        });
      }
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:8081/class")
      .then((response) => setClasses(response.data))
      .catch((error) => console.error("Error fetching classes:", error));
  }, []);

  return (
    <div className="p-6 flex flex-row max-w-full justify-between gap-6">
      <div className="bg-white shadow-md rounded-lg p-6 w-full">
        <Reg_Title name="All Fee Amount List" />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-blue-600">
                <th className="px-4 py-2 text-white">Sr No.</th>
                <th className="px-4 py-2 text-white">Class Name</th>
                <th className="px-4 py-2 text-white">Year Fee</th>
                <th className="px-4 py-2 text-white">Exam Fee</th>
                <th className="px-4 py-2 text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((fee, index) => {
                  // Find the class name based on class_id from fee and classes array
                  const className = classes[index]?.class_name || "N/A";

                  return (
                    <tr key={fee.id}>
                      <td className="px-4 py-2 text-center">{index + 1}</td>
                      <td className="px-4 py-2 text-center">{className}</td> {/* Display class name */}
                      <td className="px-4 py-2 text-center">{fee.year_fee}</td>
                      <td className="px-4 py-2 text-center">{fee.exam_fee}</td>
                      <td className="px-4 py-2 space-x-4 text-center">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEditClick(fee)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteClick(fee.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No fee amounts available
                  </td>
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
            <h2 className="text-xl font-bold mb-4">Edit Fee Amount</h2>
            <form onSubmit={editFormik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Year Fee</label>
                <input
                  type="text"
                  name="year_fee"
                  className="mt-1 p-2 border rounded w-full focus:outline-sky-500"
                  {...editFormik.getFieldProps("year_fee")}
                />
                {editFormik.touched.year_fee && editFormik.errors.year_fee && (
                  <span className="text-red-500 text-sm">
                    {editFormik.errors.year_fee}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Exam Fee</label>
                <input
                  type="text"
                  name="exam_fee"
                  className="mt-1 p-2 border rounded w-full focus:outline-sky-500"
                  {...editFormik.getFieldProps("exam_fee")}
                />
                {editFormik.touched.exam_fee && editFormik.errors.exam_fee && (
                  <span className="text-red-500 text-sm">
                    {editFormik.errors.exam_fee}
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
                <Button name="Update Fee" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fee_Amount;
