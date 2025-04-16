import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Form_Title from "../components/Form_Title";
import axios from "axios";

const Add_Faculty = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .matches(/^[A-Za-z]+$/, "First name should contain only alphabets")
      .required("Please enter First name"),
    lastName: Yup.string()
      .matches(/^[A-Za-z]+$/, "Last name should contain only alphabets")
      .required("Please enter Last name"),
    email: Yup.string()
      .email("Please enter a valid Email address")
      .required("Please Enter Email"),
    qualification: Yup.string().required("Please select Qualification"),
    phoneNo: Yup.string()
      .matches(/^\d+$/, "Only numbers are allowed")
      .length(10, "Phone number must be 10 digits")
      .required("Phone number is required"),
    subjects: Yup.array()
      .min(1, "Please select at least one subject")
      .required("Subjects are required"),
    dob: Yup.string().required("Please enter Date Of Birth"),
    gender: Yup.string().required("Please select Gender"),
    address: Yup.string().required("Please enter Address"),
    image: Yup.mixed()
          .required("Please select Image")
          .test(
            "fileType",
            "Only PNG, JPG and JPEG files are allowed",
            (value) =>
              value &&
              ["image/png", "image/jpg", "image/jpeg"].includes(value.type)
          ),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      qualification: "",
      phoneNo: "",
      subjects: [],
      dob: "",
      gender: "",
      address: "",
      image: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          formData.append(key, values[key]);
        });

        const res = await axios.post("http://localhost:8081/faculty", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        Swal.fire({
          title: "Success!",
          text: res.data.message,
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
          timerProgressBar: true,
        }).then(() => navigate("/faculty_manage"));
      } catch (error) {
        console.error("Error adding faculty:", error);
        // ✅ If email already exists, show an error
        if (error.response && error.response.status === 400) {
          Swal.fire({
            toast: true,
            position: "top",
            icon: "warning",
            title: "Duplicate Email!",
            text: "This email is already registered. Please use a different email.",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Failed to add student",
            icon: "error",
            timer: 1000,
            showConfirmButton: true,
          });
        }
      }
    },
  });

  // Fetch subjects from the database
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get("http://localhost:8081/subject");
        setSubjects(response.data); // Assuming response.data is an array of subjects
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div className="flex justify-center items-center">
      <div className="w-full bg-gray-10 shadow-lg rounded-lg p-6 mt-3">
        <Form_Title name="Add New Faculty" />
        <form className="space-y-4" onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium pb-3">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                {...formik.getFieldProps("firstName")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <span className="text-red-500 text-sm">
                  {formik.errors.firstName}
                </span>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium pb-3">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                {...formik.getFieldProps("lastName")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <span className="text-red-500 text-sm">
                  {formik.errors.lastName}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium pb-3">
              Email
            </label>
            <input
              type="email"
              name="email"
              {...formik.getFieldProps("email")}
              className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
            />
            {formik.touched.email && formik.errors.email && (
              <span className="text-red-500 text-sm">
                {formik.errors.email}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium pb-3">
                Phone No.
              </label>
              <input
                type="text"
                name="phoneNo"
                {...formik.getFieldProps("phoneNo")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              />
              {formik.touched.phoneNo && formik.errors.phoneNo && (
                <span className="text-red-500 text-sm">
                  {formik.errors.phoneNo}
                </span>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium pb-3">Subjects</label>
              <div className="flex flex-wrap gap-3">
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <label key={subject.subject_id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="subjects"
                        value={subject.subject_name} // ✅ Use correct subject property
                        checked={formik.values.subjects.includes(subject.subject_name)} // ✅ Match with value
                        onChange={(event) => {
                          const { checked, value } = event.target;
                          if (checked) {
                            formik.setFieldValue("subjects", [...formik.values.subjects, value]); // ✅ Add selected subject
                          } else {
                            formik.setFieldValue(
                              "subjects",
                              formik.values.subjects.filter((s) => s !== value) // ✅ Remove unselected subject
                            );
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span>{subject.subject_name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500">Loading subjects...</p>
                )}
              </div>
              {formik.touched.subjects && formik.errors.subjects && (
                <span className="text-red-500 text-sm">{formik.errors.subjects}</span>
              )}
            </div>

          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium pb-3">
                Date Of Birth
              </label>
              <input
                type="date"
                name="dob"
                {...formik.getFieldProps("dob")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              />
              {formik.touched.dob && formik.errors.dob && (
                <span className="text-red-500 text-sm">
                  {formik.errors.dob}
                </span>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium pb-3">
                Qualification
              </label>
              <select
                name="qualification"
                {...formik.getFieldProps("qualification")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              >
                <option>Choose...</option>
                <option value="High School">High School</option>
                <option value="Diploma">Diploma</option>
                <option value="B-tech">B-tech</option>
                <option value="M-tech">M-tech</option>
                <option value="PhD">PhD</option>
              </select>
              {formik.touched.qualification && formik.errors.qualification && (
                <span className="text-red-500 text-sm">
                  {formik.errors.qualification}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium pb-3">
                Gender
              </label>
              <select
                name="gender"
                {...formik.getFieldProps("gender")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              >
                <option value="">Choose...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {formik.touched.gender && formik.errors.gender && (
                <span className="text-red-500 text-sm">
                  {formik.errors.gender}
                </span>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium pb-3">
                Address
              </label>
              <input
                type="text"
                name="address"
                {...formik.getFieldProps("address")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              />
              {formik.touched.address && formik.errors.address && (
                <span className="text-red-500 text-sm">
                  {formik.errors.address}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium pb-3">
              Faculty Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/png, image/jpg, image/jpeg" // ✅ Restrict file picker
              className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              onChange={(event) =>
                formik.setFieldValue("image", event.currentTarget.files[0])
              }
            />
            {formik.touched.image && formik.errors.image && (
              <span className="text-red-500 text-sm">
                {formik.errors.image}
              </span>
            )}
          </div>

          <div className="text-left">
            <Button name="+ Add Faculty" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add_Faculty;