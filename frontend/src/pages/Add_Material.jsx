import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Form_Title from "../components/Form_Title";

const Add_Material = () => {
  const navigate = useNavigate();

  const initialValues = {
    materialTitle: "",
    selectedClass: "",
    selectedSubject: "",
    selectedChapters: [],
    files: null,
  };

  const validationSchema = Yup.object().shape({
    materialTitle: Yup.string()
      .min(3, "Material title must be at least 3 characters long.")
      .required("Material title is required."),
    selectedClass: Yup.string().required("Please select a class."),
    selectedSubject: Yup.string().required("Please select a subject."),
    selectedChapters: Yup.array()
      .min(1, "At least one chapter must be selected.")
      .required("Chapter selection is required."),
    files: Yup.mixed().required("Please upload at least one file."),
  });

  const handleSubmit = (values, { resetForm }) => {
    console.log("Submitted Data:", values);
  
    Swal.fire({
      title: "Success!",
      text: "Material uploaded successfully!",
      icon: "success",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK",
      timer: 2000, // Auto-close alert after 2 seconds
      timerProgressBar: true, // Show progress bar
    });
  
    setTimeout(() => {
      resetForm();
      navigate("/materials");
    }, 2000); // 2-second delay before navigating
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg mt-3">
      <Form_Title name="Add New Material" />

      <Formik 
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium">Material Title</label>
              <Field type="text" name="materialTitle" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter Material Title" />
              <ErrorMessage name="materialTitle" component="p" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Select Class</label>
              <Field as="select" name="selectedClass" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Choose Class --</option>
                <option value="class 1">Class 1</option>
                <option value="class 2">Class 2</option>
                <option value="class 3">Class 3</option>
              </Field>
              <ErrorMessage name="selectedClass" component="p" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Select Subject</label>
              <Field as="select" name="selectedSubject" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Choose Subject --</option>
                <option value="Maths">Maths</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
              </Field>
              <ErrorMessage name="selectedSubject" component="p" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Select Chapter</label>
              <Field as="select" name="selectedChapters" multiple className="w-full p-2 border border-gray-300 rounded-md h-24 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Chapter 1">Chapter 1</option>
                <option value="Chapter 2">Chapter 2</option>
                <option value="Chapter 3">Chapter 3</option>
                <option value="Chapter 4">Chapter 4</option>
                <option value="Chapter 5">Chapter 5</option>
              </Field>
              <ErrorMessage name="selectedChapters" component="p" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Multiple Material Add</label>
              <input type="file" multiple className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(event) => setFieldValue("files", event.currentTarget.files)} />
              <ErrorMessage name="files" component="p" className="text-red-500 text-sm" />
            </div>

            <Button name="Upload" />
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Add_Material;
