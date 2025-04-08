import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Button from "../components/Button";
import Form_Title from "../components/Form_Title";
import axios from 'axios';

const Add_Leave = () => {
  const initialValues = {
    fullName: "",
    leaveReason: "",
    leaveFrom: "",
    leaveTo: "",
  };

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required("Full name is required."),
    leaveReason: Yup.string().required("Leave reason is required."),
    leaveFrom: Yup.date().required("Leave from date is required."),
    leaveTo: Yup.date()
      .required("Leave to date is required.")
      .min(Yup.ref("leaveFrom"), "Leave To date must be after Leave From."),
  });

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      await axios.post('http://localhost:8081/leave', values, {
        withCredentials: true // ✅ Important for sending session cookies
      });

      Swal.fire({
        title: 'Success!',
        text: 'Leave application submitted successfully!',
        icon: 'success',
        timer: 1000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      resetForm();
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to submit leave application. Please try again.',
        icon: 'error',
        timer: 1000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      console.error('Error submitting leave application:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <Form_Title name="Leave Application" />

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className="space-y-4">

            <div>
              <label className="block text-gray-700 font-medium pb-3">Full name</label>
              <Field type="text" name="fullName" className="w-full p-2 border border-gray-300 rounded-md focus:outline-sky-500 focus:ring-blue-500" />
              <ErrorMessage name="fullName" component="p" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block text-gray-700 font-medium pb-3">Leave Reason</label>
              <Field type="text" name="leaveReason" className="w-full p-2 border border-gray-300 rounded-md focus:outline-sky-500 focus:ring-blue-500" />
              <ErrorMessage name="leaveReason" component="p" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block text-gray-700 font-medium pb-3">Leave From</label>
              <Field type="date" name="leaveFrom" className="w-full p-2 border border-gray-300 rounded-md focus:outline-sky-500 focus:ring-blue-500" />
              <ErrorMessage name="leaveFrom" component="p" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block text-gray-700 font-medium pb-3">Leave To</label>
              <Field type="date" name="leaveTo" className="w-full p-2 border border-gray-300 rounded-md focus:outline-sky-500 focus:ring-blue-500" />
              <ErrorMessage name="leaveTo" component="p" className="text-red-500 text-sm" />
            </div>

            <Button name={isSubmitting ? "Submitting..." : "Submit"} disabled={isSubmitting} />
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Add_Leave;
