import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import { useEffect, useState } from "react";

const Login = () => {
  const [error, setError] = useState("");
  const [, setUserSession] = useState(null);
  const navigate = useNavigate(); // ✅ Use navigate for redirection

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
        await axios.post("http://localhost:8081/login", {
          userName: values.userName,
          password: values.password,
        }, { withCredentials: true });
      } catch (error) {
        if (error.response && error.response.data) {
          setError(error.response.data.error);
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

      // ✅ Redirect if user role is 1 (Admin)
      navigate("/dashboard");
    } catch (error) {
      console.error("No Active Session:", error.response?.data || error);
    }
  };

  useEffect(() => {
    checkSession();
  },);

  return (
    <div className="flex h-screen">
      <div className="w-full md:w-1/4 flex flex-col justify-center items-center px-6 md:px-12 lg:px-24">
        <div className="mb-6">
          <img src="./Logo/1.png" alt="Logo" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Welcome Back!</h2>
        <p className="text-gray-500 mb-6">Sign in to continue to Easy way.</p>

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
          <Link to="/forgot_password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </p>
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
