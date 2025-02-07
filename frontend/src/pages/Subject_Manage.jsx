import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "../components/Button";
// import { useEffect, useState } from "react";

const Subject_Manage = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    subjectName: Yup.string().required("Please Enter Subject name"),
  });

  const formik = useFormik({
    initialValues: {
      subjectName: "",
    },
    validationSchema,
    onSubmit: () => {
      Swal.fire({
        title: "Success!",
        text: "New subject successfully added",
        icon: "success",
        timer: 1000,
        showConfirmButton: true,
        timerProgressBar: true,
      }).then(() => {
        formik.resetForm();  // Reset form fields after submission
        navigate("/subject_manage");
      });
    },
  });

  // const [data, setData] = useState([])
  // useEffect(() => {
  //   fetch("http://localhost:8081/subject")
  //     .then(res => res.json())
  //     .then(data => setData(data))
  //     .catch(err => console.log(err));
  // }, [])



  return (
    <div className="p-6 flex flex-row max-w-full justify-between gap-6">
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
              <tr>
                <td className="px-4 py-2 text-center"></td>
                <td className="px-4 py-2 text-center"></td>
                <td className="px-4 py-2 space-x-4 text-center">
                  <Link to={""}>
                    <button className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </button>
                  </Link>
                  <Link to={""}>
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

export default Subject_Manage;
