import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const Add_Student = () => {
  const navigate = useNavigate();

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
    class: Yup.string().required("Please select Class"),
    phoneNo: Yup.string()
      .matches(/^\d+$/, "Only numbers are allowed")
      .length(10, "Phone number must be 10 digits")
      .required("Phone number is required"),
    ephoneNo: Yup.string()
      .matches(/^\d+$/, "Only numbers are allowed")
      .length(10, "Phone number must be 10 digits")
      .required("Emergency Phone number is required"),
    dob: Yup.string().required("Please enter Date Of Birth"),
    gender: Yup.string().required("Please select Gender"),
    address: Yup.string().required("Please enter Address"),
    image: Yup.mixed().required("Please select Image"),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      class: "",
      phoneNo: "",
      ephoneNo: "",
      dob: "",
      gender: "",
      address: "",
      image: null,
    },
    validationSchema,
    onSubmit: () => {
      Swal.fire({
        title: "Success!",
        text: "Student Successfully Added",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
        timerProgressBar: true,
      }).then(() => navigate("/student_manage"));
    },
  });

  return (
    <div className="flex justify-center items-center ">
      <div className="w-full bg-gray-10 shadow-lg rounded-lg p-6 mt-3">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">
          Add New Student
        </h2>
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
              <label className="block text-gray-700 font-medium pb-3">
                Emergency Phone No.
              </label>
              <input
                type="text"
                name="ephoneNo"
                {...formik.getFieldProps("ephoneNo")}
                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
              />
              {formik.touched.ephoneNo && formik.errors.ephoneNo && (
                <span className="text-red-500 text-sm">
                  {formik.errors.ephoneNo}
                </span>
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
                <option value="Other">Other</option>
              </select>
              {formik.touched.gender && formik.errors.gender && (
                <span className="text-red-500 text-sm">
                  {formik.errors.gender}
                </span>
              )}
            </div>

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
                <option value="Class1">Class 1</option>
                <option value="Class2">Class 2</option>
                <option value="Class3">Class 3</option>
              </select>
              {formik.touched.class && formik.errors.class && (
                <span className="text-red-500 text-sm">
                  {formik.errors.class}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium pb-3">
              Student Image
            </label>
            <input
              type="file"
              name="image"
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
            <Button name="+ Add Student" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add_Student;
