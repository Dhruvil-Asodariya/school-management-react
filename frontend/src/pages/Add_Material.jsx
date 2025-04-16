import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Button from "../components/Button";
import Form_Title from "../components/Form_Title";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Add_Student = () => {
  const navigate = useNavigate();

  // ✅ Updated validation schema
  const validationSchema = Yup.object({
    materialTitle: Yup.string()
      .matches(/^[A-Za-z\s]+$/, "Material title should contain only alphabets")
      .required("Please enter Material title"),
    class: Yup.string().required("Please select Class"),
    subject: Yup.string().required("Please select Subject"),
    chapter: Yup.string().required("Please select Chapter"),
    file: Yup.mixed()
      .required("Please select a file")
      .test(
        "fileType",
        "Only PDF and Word documents are allowed.",
        (value) =>
          value
            ? ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(value.type)
            : false
      )
      .test("fileSize", "File size must be less than 5MB.", (value) =>
        value ? value.size <= 5 * 1024 * 1024 : false
      ),
  });

  const formik = useFormik({
    initialValues: {
      materialTitle: "",
      class: "",
      subject: "",
      chapter: "",
      file: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("materialTitle", values.materialTitle);
        formData.append("class", values.class);
        formData.append("subject", values.subject);
        formData.append("chapter", values.chapter);
        formData.append("file", values.file); // ✅ Corrected file field

        await axios.post("http://localhost:8081/material", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        Swal.fire({
          title: "Success!",
          text: "New material successfully added",
          icon: "success",
          timer: 1000,
          showConfirmButton: true,
          timerProgressBar: true,
        }).then(() => {
          formik.resetForm();
          navigate("/materials");
        });
      } catch (error) {
        console.error("Error adding material:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to add material",
          icon: "error",
          timer: 1000,
          showConfirmButton: true,
        });
      }
    },
  });

  return (
    <div className="flex justify-center items-center">
      <div className="w-full bg-gray-10 shadow-lg rounded-lg p-6 mt-3">
        <Form_Title name="Add New Material" />
        <form className="space-y-4" onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Material Title */}
            <div>
              <label className="block text-gray-700 font-medium pb-3">
                Material Title
              </label>
              <input
                type="text"
                name="materialTitle"
                {...formik.getFieldProps("materialTitle")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              />
              {formik.touched.materialTitle && formik.errors.materialTitle && (
                <span className="text-red-500 text-sm">
                  {formik.errors.materialTitle}
                </span>
              )}
            </div>

            {/* Class Selection */}
            <div>
              <label className="block text-gray-700 font-medium pb-3">
                Class
              </label>
              <select
                name="class"
                {...formik.getFieldProps("class")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              >
                <option value="">Choose...</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              {formik.touched.class && formik.errors.class && (
                <span className="text-red-500 text-sm">{formik.errors.class}</span>
              )}
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-gray-700 font-medium pb-3">
                Subject
              </label>
              <select
                name="subject"
                {...formik.getFieldProps("subject")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              >
                <option value="">Choose...</option>
                {["Maths", "English", "Hindi", "Gujarati"].map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              {formik.touched.subject && formik.errors.subject && (
                <span className="text-red-500 text-sm">{formik.errors.subject}</span>
              )}
            </div>

            {/* Chapter Selection */}
            <div>
              <label className="block text-gray-700 font-medium pb-3">
                Chapter
              </label>
              <select
                name="chapter"
                {...formik.getFieldProps("chapter")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              >
                <option value="">Choose...</option>
                {[...Array(5)].map((_, i) => (
                  <option key={i} value={`Chapter ${i + 1}`}>
                    Chapter {i + 1}
                  </option>
                ))}
              </select>
              {formik.touched.chapter && formik.errors.chapter && (
                <span className="text-red-500 text-sm">{formik.errors.chapter}</span>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-gray-700 font-medium pb-3">
              Material File (PDF or Word)
            </label>
            <input
              type="file"
              name="file"
              accept=".pdf,.doc,.docx"
              className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              onChange={(event) => formik.setFieldValue("file", event.currentTarget.files[0])}
            />
            {formik.touched.file && formik.errors.file && (
              <span className="text-red-500 text-sm">{formik.errors.file}</span>
            )}
          </div>

          {/* Submit Button */}
          <div className="text-left">
            <Button name="Upload" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add_Student;
