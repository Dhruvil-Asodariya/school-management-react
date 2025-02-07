import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Button from "../components/Button";

const Add_Leave = () => {
  const initialValues = {
    leaveReason: "",
    leaveDay: "",
    leaveDate: "",
  };

  const validationSchema = Yup.object().shape({
    leaveReason: Yup.string().required("Leave reason is required."),
    leaveDay: Yup.string().required("Leave day is required."),
    leaveDate: Yup.date().required("Leave date is required."),
  });

  const handleSubmit = (values, { resetForm }) => {
    console.log("Form Submitted:", values);
  
    // Show SweetAlert2 success message
    Swal.fire({
      title: "Success!",
      text: "Leave application submitted successfully!",
      icon: "success",
      timer: 1500, // Auto-close after 1.5 seconds
      timerProgressBar: true,
      showConfirmButton: false,
    });
  
    // Ensure resetForm runs after the alert
    setTimeout(() => {
      resetForm();
    }, 1500); // Slightly more than the Swal timer to ensure execution
  };

  return (
    <div className="mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Leave Application</h2>

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {() => (
          <Form className="space-y-4">
            {/* Leave Reason */}
            <div>
              <label className="block text-gray-700 font-medium pb-3">Please Enter Leave Reason</label>
              <Field as="textarea" name="leaveReason" className="w-full p-2 border border-gray-300 rounded-md focus:outline-sky-500 focus:ring-blue-500" />
              <ErrorMessage name="leaveReason" component="p" className="text-red-500 text-sm" />
            </div>

            {/* Leave Day */}
            <div>
              <label className="block text-gray-700 font-medium pb-3">Please Leave Day</label>
              <Field type="text" name="leaveDay" className="w-full p-2 border border-gray-300 rounded-md focus:outline-sky-500 focus:ring-blue-500" />
              <ErrorMessage name="leaveDay" component="p" className="text-red-500 text-sm" />
            </div>

            {/* Leave Date */}
            <div>
              <label className="block text-gray-700 font-medium pb-3">Date Leave Applied on</label>
              <Field type="date" name="leaveDate" className="w-full p-2 border border-gray-300 rounded-md focus:outline-sky-500 focus:ring-blue-500" />
              <ErrorMessage name="leaveDate" component="p" className="text-red-500 text-sm" />
            </div>

            {/* Submit Button */}
            <Button name="Submit" />
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Add_Leave;