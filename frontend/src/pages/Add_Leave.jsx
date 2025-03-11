import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Button from "../components/Button";
import Form_Title from "../components/Form_Title";
import axios from "axios";

const Add_Leave = () => {
  const validationSchema = Yup.object().shape({
    leaveReason: Yup.string().required("Leave reason is required."),
    leaveFrom: Yup.date().required("Leave from date is required."),
    leaveTo: Yup.date()
      .required("Leave to date is required.")
      .min(Yup.ref("leaveFrom"), "Leave To date must be after Leave From."),
  });

  // Add Subject
  // ✅ Formik for Adding Subject
  const formik = useFormik({
    initialValues: {
      leaveReason: "",
      leaveFrom: "",
      leaveTo: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.post("http://localhost:8081/leave", {
          leaveReason: values.leaveReason,
          leaveFrom: values.leaveFrom,
          leaveTo: values.leaveTo,
        });

        Swal.fire({
          title: "Success!",
          text: "New leave successfully added",
          icon: "success",
          timer: 1000,
          showConfirmButton: true,
          timerProgressBar: true,
        }).then(() => {
          formik.resetForm();
        });

      } catch (error) {
        console.error("Error adding leave:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to add leave",
          icon: "error",
          showConfirmButton: true,
        });
      }
    },
  });

  return (
    <div className="flex justify-center items-center">
      <div className="w-full bg-white shadow-lg rounded-lg p-6 mt-3">
        <Form_Title name="Add New Leave" />
        <form className="space-y-4" onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Leave Reason */}
            <div>
              <label className="block text-gray-700 font-medium pb-2">
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

            {/* Leave From */}
            <div>
              <label className="block text-gray-700 font-medium pb-2">
                Leave From
              </label>
              <input
                type="date"
                name="leaveFrom"
                {...formik.getFieldProps("leaveFrom")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              />
              {formik.touched.leaveFrom && formik.errors.leaveFrom && (
                <span className="text-red-500 text-sm">
                  {formik.errors.leaveFrom}
                </span>
              )}
            </div>
          </div>

          {/* Leave To */}
          <div>
            <label className="block text-gray-700 font-medium pb-2">
              Leave To
            </label>
            <input
              type="date"
              name="leaveTo"
              {...formik.getFieldProps("leaveTo")}
              className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
            />
            {formik.touched.leaveTo && formik.errors.leaveTo && (
              <span className="text-red-500 text-sm">
                {formik.errors.leaveTo}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <div className="text-left">
            <Button name="Submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add_Leave;
