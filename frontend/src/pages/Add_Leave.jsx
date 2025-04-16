import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Button from "../components/Button";
import Form_Title from "../components/Form_Title";
import axios from "axios";

const Add_Student = () => {


  const validationSchema = Yup.object({
    leaveReason: Yup.string()
      .matches(/^[A-Za-z\s.,'-]+$/, "Leave reason should contain only alphabets and common punctuation")
      .required("Please enter leave reason"),
    fromDate: Yup.date()
      .required("Please enter From Date"),
    toDate: Yup.date()
      .min(Yup.ref('fromDate'), "To Date cannot be before From Date")
      .required("Please enter To Date"),
  });


  const formik = useFormik({
    initialValues: {
      leaveReason: "",
      fromDate: "",
      toDate: ""
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.post("http://localhost:8081/leave", values, { withCredentials: true });
    
        Swal.fire({
          title: "Success!",
          text: "Leave application has been submitted",
          icon: "success",
          timer: 1000,
          showConfirmButton: true,
          timerProgressBar: true,
        }).then(() => {
          formik.resetForm();
        });
      } catch (error) {
        console.error("Error submitting leave:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to submit leave",
          icon: "error",
          timer: 1000,
          showConfirmButton: true,
          timerProgressBar: true,
        });
      }
    }
       
  }
  );


  return (
    <div className="flex justify-center items-center ">
      <div className="w-full bg-gray-10 shadow-lg rounded-lg p-6 mt-3">
        <Form_Title name="Add Leave Application" />
        <form className="space-y-4" onSubmit={formik.handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium pb-3">
              Leave Reason
            </label>
            <input
              type="text"
              name="leaveReason"
              {...formik.getFieldProps("leaveReason")}
              className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
            />
            {formik.touched.leaveReason && formik.errors.leaveReason && (
              <span className="text-red-500 text-sm">
                {formik.errors.leaveReason}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium pb-3">
                From Date
              </label>
              <input
                type="date"
                name="fromDate"
                {...formik.getFieldProps("fromDate")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              />
              {formik.touched.fromDate && formik.errors.fromDate && (
                <span className="text-red-500 text-sm">
                  {formik.errors.fromDate}
                </span>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium pb-3">
                To Date
              </label>
              <input
                type="date"
                name="toDate"
                {...formik.getFieldProps("toDate")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              />
              {formik.touched.toDate && formik.errors.toDate && (
                <span className="text-red-500 text-sm">
                  {formik.errors.toDate}
                </span>
              )}
            </div>
          </div>


          <div className="text-left">
            <Button name="+ Add Student" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add_Student;