import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const Login = () => {
  const [error, setError] = useState(""); // To store error messages
  const [userSession, setUserSession] = useState(null);

  const validationSchema = Yup.object({
    userName: Yup.string().required("Please enter user name"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Please enter your password"),
  });

  const formik = useFormik({
    initialValues: {
      userName: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setError(""); // Reset error before submitting
      try {
        const res = await axios.post("http://localhost:8081/login", {
          userName: values.userName,
          password: values.password,
        }, { withCredentials: true });

        Swal.fire({
          title: "Success!",
          text: res.data.message,
          icon: "success",
          timer: 1000,
          showConfirmButton: true,
          timerProgressBar: true,
        }).then(() => {
          formik.resetForm();
          checkSession();
        });

      } catch (error) {
        if (error.response && error.response.data) {
          setError(error.response.data.error); // Set specific error message
        } else {
          setError("An unknown error occurred.");
        }
      }
    },
  });

  // ✅ Function to Check Active Session
  const checkSession = async () => {
    try {
      const response = await axios.get("http://localhost:8081/session", { withCredentials: true });
      setUserSession(response.data);
    } catch (error) {
      console.error("No Active Session:", error.response?.data || error);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="flex h-screen">
      <div className="w-full md:w-1/4 flex flex-col justify-center items-center px-6 md:px-12 lg:px-24">
        <div className="mb-6">
          <img src="./Logo/1.png" alt="Logo" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Welcome Back!</h2>
        <p className="text-gray-500 mb-6">Sign in to continue to Edusphere.</p>

        <form onSubmit={formik.handleSubmit} className="w-full max-w-sm">
          <div className="mb-4">
            <label className="block text-gray-700">User Name</label>
            <input
              type="text"
              name="userName"
              {...formik.getFieldProps("userName")}
              className="w-full px-4 py-2 border rounded focus:outline-sky-600"
              placeholder="user name"
            />
            {formik.touched.userName && formik.errors.userName && (
              <span className="text-red-500 text-sm">{formik.errors.userName}</span>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              {...formik.getFieldProps("password")}
              className="w-full px-4 py-2 border rounded focus:outline-sky-600"
              placeholder="password"
            />
            {formik.touched.password && formik.errors.password && (
              <span className="text-red-500 text-sm">{formik.errors.password}</span>
            )}
          </div>

          {/* ✅ Show error message if exists */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </form>

        <p className="mt-4 text-gray-500">
          Don’t have an account?{" "}
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </p>

        {/* ✅ Show Session Data */}
        {userSession && (
          <div className="mt-4 p-4 bg-green-100 rounded-lg">
            <h3 className="text-lg font-semibold">Active Session:</h3>
            <p><b>User:</b> {userSession.user.userName}</p>
            <p><b>Role:</b> {userSession.user.role}</p>
            <p><b>Message:</b> {userSession.message}</p>
          </div>
        )}
      </div>

      <div className="md:w-3/4 relative">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('/login.jpg')" }}
        ></div>
      </div>
    </div>
  );
};

export default Login;
